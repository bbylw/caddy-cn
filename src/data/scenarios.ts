export interface Scenario {
  id: string;
  name: string;
  summary: string;
  caddyfile: string;
  /** caddy adapt 的输出（节选，省略了日志、存储等与场景无关的部分） */
  json: string;
  /** Caddy 在这个配置下会自动完成的事 */
  effects: string[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'static',
    name: '静态站点',
    summary: '一个目录，一个域名，其余由 Caddy 处理',
    caddyfile: `example.com {
	root * /var/www/example
	file_server
	encode gzip
}`,
    json: `{
  "apps": {
    "http": {
      "servers": {
        "srv0": {
          "listen": [":443"],
          "routes": [
            {
              "match": [{ "host": ["example.com"] }],
              "handle": [
                { "handler": "vars", "root": "/var/www/example" },
                { "handler": "encode", "encodings": { "gzip": {} } },
                { "handler": "file_server" }
              ],
              "terminal": true
            }
          ]
        }
      }
    },
    "tls": {
      "automation": {
        "policies": [{ "subjects": ["example.com"] }]
      }
    }
  }
}`,
    effects: [
      '向公共 ACME CA 申请 example.com 的证书',
      '80 端口的 HTTP 请求跳转到 HTTPS',
      '按 Accept-Encoding 协商 gzip 压缩',
      '证书到期前在后台自动续期',
    ],
  },
  {
    id: 'proxy',
    name: '反向代理',
    summary: '三个上游，最少连接调度，主动健康检查',
    caddyfile: `api.example.com {
	reverse_proxy 10.0.0.1:8080 10.0.0.2:8080 10.0.0.3:8080 {
		lb_policy least_conn
		health_uri /healthz
		health_interval 10s
	}
}`,
    json: `{
  "apps": {
    "http": {
      "servers": {
        "srv0": {
          "listen": [":443"],
          "routes": [
            {
              "match": [{ "host": ["api.example.com"] }],
              "handle": [
                {
                  "handler": "reverse_proxy",
                  "load_balancing": {
                    "selection_policy": { "policy": "least_conn" }
                  },
                  "health_checks": {
                    "active": { "uri": "/healthz", "interval": 10000000000 }
                  },
                  "upstreams": [
                    { "dial": "10.0.0.1:8080" },
                    { "dial": "10.0.0.2:8080" },
                    { "dial": "10.0.0.3:8080" }
                  ]
                }
              ],
              "terminal": true
            }
          ]
        }
      }
    }
  }
}`,
    effects: [
      '自动为 api.example.com 管理证书',
      '主动健康检查，失败的上游自动摘除',
      '默认带上 X-Forwarded-For，后端拿到真实客户端 IP',
      '上游同样可以走 HTTPS，并支持 HTTP/3',
    ],
  },
  {
    id: 'local',
    name: '本地 HTTPS',
    summary: '没有公网域名，也能拿到浏览器信任的绿锁',
    caddyfile: `localhost:8443 {
	reverse_proxy 127.0.0.1:5173
	tls internal
}`,
    json: `{
  "apps": {
    "http": {
      "servers": {
        "srv0": {
          "listen": [":8443"],
          "routes": [
            {
              "match": [{ "host": ["localhost"] }],
              "handle": [
                {
                  "handler": "reverse_proxy",
                  "upstreams": [{ "dial": "127.0.0.1:5173" }]
                }
              ],
              "terminal": true
            }
          ]
        }
      }
    },
    "tls": {
      "automation": {
        "policies": [
          {
            "subjects": ["localhost"],
            "issuers": [{ "module": "internal" }]
          }
        ]
      }
    }
  }
}`,
    effects: [
      '生成 Caddy 本地 CA，包含根证书与中间证书',
      '首次使用时把根证书装进系统信任库',
      '签发本地可信证书，浏览器不再报安全错误',
      '全程不走 ACME，也不需要对外开放端口',
    ],
  },
  {
    id: 'multi',
    name: '多站点',
    summary: '一个文件管多个域名，www 永久跳转到主域',
    caddyfile: `example.com {
	root * /srv/site
	file_server
}

www.example.com {
	redir https://example.com{uri} permanent
}`,
    json: `{
  "apps": {
    "http": {
      "servers": {
        "srv0": {
          "listen": [":443"],
          "routes": [
            {
              "match": [{ "host": ["example.com"] }],
              "handle": [
                { "handler": "vars", "root": "/srv/site" },
                { "handler": "file_server" }
              ],
              "terminal": true
            },
            {
              "match": [{ "host": ["www.example.com"] }],
              "handle": [
                {
                  "handler": "static_response",
                  "headers": {
                    "Location": ["https://example.com{http.request.uri}"]
                  },
                  "status_code": 308
                }
              ],
              "terminal": true
            }
          ]
        }
      }
    }
  }
}`,
    effects: [
      '两个域名各自管理证书，互不影响',
      'www 到主域的永久跳转，状态码 308',
      '站点块之间没有继承，各自独立',
      '指令按预设顺序生效，与书写顺序无关',
    ],
  },
  {
    id: 'on-demand',
    name: '按需 TLS',
    summary: '域名事先写不进配置，握手时再签发',
    caddyfile: `{
	on_demand_tls {
		ask http://127.0.0.1:9000/check
	}
}

https:// {
	tls {
		on_demand
	}
	reverse_proxy 10.0.2.9:8000
}`,
    json: `{
  "apps": {
    "http": {
      "servers": {
        "srv0": {
          "listen": [":443"],
          "routes": [
            {
              "handle": [
                {
                  "handler": "reverse_proxy",
                  "upstreams": [{ "dial": "10.0.2.9:8000" }]
                }
              ]
            }
          ]
        }
      }
    },
    "tls": {
      "automation": {
        "on_demand": { "ask": "http://127.0.0.1:9000/check" },
        "policies": [{ "on_demand": true }]
      }
    }
  }
}`,
    effects: [
      '首次 TLS 握手时才申请证书，不必预先列域名',
      '靠 ask 端点限制签发范围，防止被滥用',
      '证书缓存复用，后续握手不再等待',
      '续期在后台进行，不影响在线请求',
    ],
  },
];
