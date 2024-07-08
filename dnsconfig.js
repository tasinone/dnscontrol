var regNone = NewRegistrar("none");
var providerCf = DnsProvider(NewDnsProvider("cloudflare"));

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
  var proxyState = { "cloudflare_proxy": "off" }; // Adjust based on your requirements

  if (!commit[domainData.domain]) {
    commit[domainData.domain] = [];
  }

  // Add NS records
  if (domainData.record.NS) {
    for (var ns in domainData.record.NS) {
      commit[domainData.domain].push(
        NS(domainData.domain, domainData.record.NS[ns])
      );
    }
  }

  // You can add other record types (A, AAAA, CNAME, MX, TXT) similarly

}

for (var domainName in commit) {
  D(domainName, regNone, providerCf, commit[domainName]);
}
