var regNone = NewRegistrar("none");
var providerCf = DnsProvider(NewDnsProvider("cloudflare"));

var proxy = {
  on: { "cloudflare_proxy": "on" },
  off: { "cloudflare_proxy": "off" }
};

function getDomainsList(filesPath) {
  var result = [];
  var files = glob.apply(null, [filesPath, true, '.json']);

  for (var i = 0; i < files.length; i++) {
    var basename = files[i].split('/').reverse()[0];
    var name = basename.split('.')[0];

    result.push({name: name, data: require(files[i])});
  }

  return result;
}

var domains = getDomainsList('./domains');

var commit = {};

for (var idx in domains) {
  var domainData = domains[idx].data;
  var proxyState = proxy.on; // enabled by default

  if (!commit[domainData.domain]) {
    commit[domainData.domain] = [];
  }

  if (domainData.proxied === false) {
    proxyState = proxy.off;
  }

  if (domainData.record.A) {
    for (var a in domainData.record.A) {
      commit[domainData.domain].push(
        A(domainData.subdomain, IP(domainData.record.A[a]), proxyState)
      )
    }
  }

  if (domainData.record.AAAA) {
    for (var aaaa in domainData.record.AAAA) {
      commit[domainData.domain].push(
        AAAA(domainData.subdomain, domainData.record.AAAA[aaaa], proxyState)
      )
    }
  }

  if (domainData.record.CNAME) {
    commit[domainData.domain].push(
      CNAME(domainData.subdomain, domainData.record.CNAME + ".", proxyState)
    )
  }
  
  if (domainData.record.MX) {
    for (var mx in domainData.record.MX) {
      commit[domainData.domain].push(
        MX(domainData.subdomain, 10, domainData.record.MX[mx] + ".")
      )
    }  
  }

  if (domainData.record.NS) {
    for (var ns in domainData.record.NS) {
      commit[domainData.domain].push(
        NS(domainData.subdomain, domainData.record.NS[ns] + ".")
      )
    }
  }

  if (domainData.record.TXT) {
    for (var txt in domainData.record.TXT) {
      commit[domainData.domain].push(
        TXT(domainData.subdomain, domainData.record.TXT[txt])
      )
    }
  }
}

for (var domainName in commit) {
  D(domainName, regNone, providerCf, commit[domainName]);
}
