var regNone = NewRegistrar("none");
var providerCf = DnsProvider(NewDnsProvider("cloudflare"));

var proxy = {
  on: { "cloudflare_proxy": "on" },
  off: { "cloudflare_proxy": "off" }
};

D("tasin.is-cool.dev", regNone, providerCf,
  TXT("_github-pages-challenge-tasinone", "18f7194a5cecc963de377f8649ebbd")
);
