const axios = require("axios").default;
const httpsProxyAgent = require('https-proxy-agent');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;
interface V1ProxyVisibility {
    ip: string,
    country_iso: string
}
interface V1ProxyAPIResponse {
    id: string,
    host: string,
    port: number,
    visibility: V1ProxyVisibility,
}
interface V1APIResponse {
    success: boolean,
    proxy: V1ProxyAPIResponse
}

function usage() {
    console.log(`
    Required options:
        --x-rapidapi-key <key> RapidAPI user's key
        --number-of-proxies <number> Number of proxies to use for hitting the target
        --target <http/s target> Example: http://www.mywebsite.com
    `)
}

async function getProxies(n: number): Promise<V1ProxyAPIResponse[]> {
    var options = {
        method: 'GET',
        url: 'https://ephemeral-proxies.p.rapidapi.com/v1/proxy',
        headers: {
            'x-rapidapi-host': 'ephemeral-proxies.p.rapidapi.com',
            'x-rapidapi-key': argv.xRapidapiKey
        }
    };
    let p = []
    for (let i=0; i<n; i++) {
        p.push(axios.request(options))
    }
    let responses = await Promise.allSettled(p)
    let successfullResponses = responses.filter(r => {
        if (r.status === 'fulfilled') {
            if (r.value.data.success) return true;
            console.warn(r.value.data)
        } else if (r.status === 'rejected') {
            console.warn(r)
        }
        return false
    })
    return successfullResponses.map((r:any) => r.value.data.proxy)
}

async function hitTarget(proxIp: string, proxyPort: number,  targetUrl:string) {
    let agent = new httpsProxyAgent(`http://${proxIp}:${proxyPort}`);
    let options = {
        httpsAgent: agent,
        method: 'GET',
        url: targetUrl,
        headers: {
            'accept': 'application/json'
        }
    }
    return axios.request(options)
}

(async () => {
    if (!argv.xRapidapiKey || !argv.numberOfProxies || !argv.target) {
        usage()
        process.exit(-1)
    }
    try {
        let target = argv.target
        let nProxies = parseInt(argv.numberOfProxies)
        console.log(`Collecting ${nProxies} proxies ...`)
        let proxies: V1ProxyAPIResponse[] = await getProxies(nProxies)
        if (proxies.length > 0) {
            let uniqueProxiesIp = new Set(proxies.map(p => p.visibility.ip)).size
            let uniqueCountries = new Set(proxies.map(p => p.visibility.country_iso)).size
            console.log(`Hiting ${target} using ${proxies.length} proxies with ${uniqueProxiesIp} different ips from ${uniqueCountries} different countries ...`)
            let results = await Promise.allSettled(proxies.map(p => hitTarget(p.host, p.port, target)))
            let targetSuccess = 0
            results.map((r: any) => { if (r.status == 'fulfilled') targetSuccess++ })
            console.log(`Successful requests against target: ${targetSuccess}`)
        }
    } catch (e) {
        console.warn(e)
        process.exit(-1)
    }
})()
