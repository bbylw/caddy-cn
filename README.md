<p align="center">
	<a href="https://caddyserver.com">
		<picture>
			<source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/1d6be89c-df8a-438c-b01d-cef6bf56440a">
			<source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/3a5b7419-6925-48f6-ae75-d231f4a4f0c2">
			<img src="https://github.com/user-attachments/assets/3a5b7419-6925-48f6-ae75-d231f4a4f0c2" alt="Caddy" width="550">
		</picture>
	</a>
	<br>
	<h3 align="center">一个 <a href="https://zerossl.com"><img src="https://user-images.githubusercontent.com/55066419/208327323-2770dc16-ec09-43a0-9035-c5b872c2ad7f.svg" height="28" style="vertical-align: -7.7px" valign="middle"></a> 项目</h3>
</p>
<hr>
<h3 align="center">让每个站点都运行在 HTTPS 上</h3>
<p align="center">Caddy 是一个默认使用 TLS 的可扩展服务器平台。</p>
<p align="center">
	<a href="https://github.com/caddyserver/caddy/releases">发布版本</a> ·
	<a href="https://caddyserver.com/docs/">文档</a> ·
	<a href="https://caddy.community">获取帮助</a>
</p>
<p align="center">
	<a href="https://github.com/caddyserver/caddy/actions/workflows/ci.yml"><img src="https://github.com/caddyserver/caddy/actions/workflows/ci.yml/badge.svg"></a>
	&nbsp;
	<a href="https://www.bestpractices.dev/projects/7141"><img src="https://www.bestpractices.dev/projects/7141/badge"></a>
	&nbsp;
	<a href="https://pkg.go.dev/github.com/caddyserver/caddy/v2"><img src="https://img.shields.io/badge/godoc-reference-%23007d9c.svg"></a>
	&nbsp;
	<a href="https://x.com/caddyserver" title="@caddyserver on Twitter"><img src="https://img.shields.io/twitter/follow/caddyserver" alt="@caddyserver on Twitter"></a>
	&nbsp;
	<a href="https://caddy.community" title="Caddy Forum"><img src="https://img.shields.io/badge/community-forum-ff69b4.svg" alt="Caddy Forum"></a>
	<br>
	<a href="https://sourcegraph.com/github.com/caddyserver/caddy?badge" title="Caddy on Sourcegraph"><img src="https://sourcegraph.com/github.com/caddyserver/caddy/-/badge.svg" alt="Caddy on Sourcegraph"></a>
	&nbsp;
	<a href="https://cloudsmith.io/~caddy/repos/"><img src="https://img.shields.io/badge/OSS%20hosting%20by-cloudsmith-blue?logo=cloudsmith" alt="Cloudsmith"></a>
</p>
<p align="center">
	<b>由以下项目驱动</b>
	<br>
	<a href="https://github.com/caddyserver/certmagic">
		<picture>
			<source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/55066419/206946718-740b6371-3df3-4d72-a822-47e4c48af999.png">
			<source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/1128849/49704830-49d37200-fbd5-11e8-8385-767e0cd033c3.png">
			<img src="https://user-images.githubusercontent.com/1128849/49704830-49d37200-fbd5-11e8-8385-767e0cd033c3.png" alt="CertMagic" width="250">
		</picture>
	</a>
</p>

<!-- Warp sponsorship requests this section -->
<div align="center" markdown="1">
	<hr>
	<sup>特别感谢：</sup>
	<br>
	<a href="https://go.warp.dev/caddy">
		<img alt="Warp 赞助" width="400" src="https://github.com/user-attachments/assets/c8efffde-18c7-4af4-83ed-b1aba2dda394">
	</a>

### [Warp，为配合多个 AI 智能体编程而打造](https://go.warp.dev/caddy)
[适用于 macOS、Linux 和 Windows](https://go.warp.dev/caddy)<br>
</div>

<hr>

### 目录

- [特性](#特性)
- [安装](#安装)
- [从源码构建](#从源码构建)
	- [用于开发](#用于开发)
	- [带版本信息和/或插件](#带版本信息和或插件)
- [快速开始](#快速开始)
- [概览](#概览)
- [完整文档](#完整文档)
- [获取帮助](#获取帮助)
- [关于](#关于)


## [特性](https://caddyserver.com/features)

- **易于配置**：使用 [Caddyfile](https://caddyserver.com/docs/caddyfile)
- **强大的配置**：使用原生 [JSON 配置](https://caddyserver.com/docs/json/)
- **动态配置**：通过 [JSON API](https://caddyserver.com/docs/api)
- [**配置适配器**](https://caddyserver.com/docs/config-adapters)（如果你不喜欢 JSON）
- **默认自动 HTTPS**
	- 公网域名使用 [ZeroSSL](https://zerossl.com) 与 [Let's Encrypt](https://letsencrypt.org)
	- 为内部域名和 IP 提供完全托管的本地 CA
	- 可在集群中与其他 Caddy 实例协同工作
	- 多证书颁发机构回退
	- 支持加密客户端 Hello（ECH）
- **在其他服务器因 TLS/OCSP/证书相关问题宕机时依然保持在线**
- **经过生产验证**：已服务数万亿次请求，管理数百万张 TLS 证书
- **可扩展至数十万个站点**，已在生产中得到证明
- **默认支持 HTTP/1.1、HTTP/2 和 HTTP/3**
- **高度可扩展**：[模块化架构](https://caddyserver.com/docs/architecture) 让 Caddy 能做任何事而不会臃肿
- **随处运行**，且**无外部依赖**（甚至不需要 libc）
- 使用 Go 语言编写，相比其他服务器具有更高的**内存安全保证**
- 用起来**真的很有趣**
- 还有更多值得[探索](https://caddyserver.com/features)之处

## 安装

最简单的跨平台上手方式是从 [GitHub Releases](https://github.com/caddyserver/caddy/releases) 下载 Caddy，并将可执行文件放入你的 PATH 中。

有关其他安装方式，请参阅[我们的在线文档](https://caddyserver.com/docs/install)。

## 从源码构建

要求：

- [Go 1.26.0 或更高版本](https://golang.org/dl/)

### 用于开发

_**注意：** 这些步骤[不会嵌入正确的版本信息](https://github.com/golang/go/issues/29228)。如需嵌入版本信息，请遵循下一节的说明。_

```bash
$ git clone "https://github.com/caddyserver/caddy.git"
$ cd caddy/cmd/caddy/
$ go build
```

当你运行 Caddy 时，除非在配置中另有指定，否则它可能会尝试绑定到低端口。如果你的操作系统需要提升的权限才能这样做，你需要为新的二进制文件授予相应权限。在 Linux 上，可以很方便地使用以下命令完成：`sudo setcap cap_net_bind_service=+ep ./caddy`

如果你更喜欢使用 `go run`（它只创建临时二进制文件），仍然可以通过自带的 `setcap.sh` 实现，方式如下：

```bash
$ go run -exec ./setcap.sh main.go
```

如果你不想在 `setcap` 时输入密码，可以使用 `sudo visudo` 编辑你的 sudoers 文件，允许你的用户账户无需密码运行该命令，例如：

```
username ALL=(ALL:ALL) NOPASSWD: /usr/sbin/setcap
```

将 `username` 替换为你的实际用户名。请谨慎操作，并且只有在你知道自己在做什么时才这样做！我们仅有权记录如何使用 Caddy，而非 Go 工具或你的电脑；我们提供这些说明仅出于便利，请自行承担风险去学习如何使用你自己的电脑，并做出任何必要的调整。

然后你可以在所有模块或某个特定模块中运行测试：

```bash
$ go test ./...
$ go test ./modules/caddyhttp/tracing/
```

### 带版本信息和/或插件

使用[我们的构建工具 `xcaddy`](https://github.com/caddyserver/xcaddy)……

```bash
$ xcaddy build
```

……以下步骤已自动化：

1. 创建一个新文件夹：`mkdir caddy`
2. 进入该文件夹：`cd caddy`
3. 将 [Caddy 的 main.go](https://github.com/caddyserver/caddy/blob/master/cmd/caddy/main.go) 复制到空文件夹中。为想要添加的自定义插件添加 import。
4. 初始化 Go 模块：`go mod init caddy`
5. （可选）固定 Caddy 版本：`go get github.com/caddyserver/caddy/v2@version`，将 `version` 替换为 git 标签、提交或分支名。
6. （可选）通过添加 import 来加入插件：`_ "import/path/here"`
7. 编译：`go build -tags=nobadger,nomysql,nopgx`



## 快速开始

[Caddy 官网](https://caddyserver.com/docs/) 上的文档包含教程、快速上手指南、参考等内容。

**我们建议所有用户——无论经验水平——都先阅读我们的[入门指南](https://caddyserver.com/docs/getting-started)，以熟悉 Caddy 的使用。**

如果你只有一分钟时间，[官网上也有多个快速上手教程](https://caddyserver.com/docs/quick-starts) 可供选择！不过在完成快速上手教程后，请继续阅读更多文档，以了解软件的工作原理。🙂



## 概览

Caddy 最常被用作 HTTPS 服务器，但它也适用于任何长期运行的 Go 程序。首先，它是一个运行 Go 应用的平台。Caddy 的「应用」只是以 Caddy 模块形式实现的 Go 程序。Caddy 标准随附两个应用——`tls` 和 `http`。

Caddy 应用可立即受益于[自动化文档](https://caddyserver.com/docs/json/)、通过 API 实现的优雅在线[配置变更](https://caddyserver.com/docs/api)，以及与其他 Caddy 应用的统一。

虽然 [JSON](https://caddyserver.com/docs/json/) 是 Caddy 的原生配置语言，但 Caddy 可以接受来自[配置适配器](https://caddyserver.com/docs/config-adapters)的输入，这些适配器本质上能把你选择的任何配置格式转换为 JSON：Caddyfile、JSON 5、YAML、TOML、NGINX 配置等。

配置 Caddy 的主要方式是通过[它的 API](https://caddyserver.com/docs/api)，但如果你更喜欢配置文件，[命令行接口](https://caddyserver.com/docs/command-line)也同样支持。

与其他现存的任何 Web 服务器相比，Caddy 提供了空前水平的控制能力。在 Caddy 中，你通常是在设置内存中已初始化类型的实际值，这些值驱动着从 HTTP 处理器、TLS 握手到存储介质的一切。Caddy 也极具可扩展性，拥有强大的插件系统，相较其他 Web 服务器有巨大改进。

要驾驭这一设计的能力，你需要了解配置文档的结构。有关 [Caddy 的配置结构](https://caddyserver.com/docs/json/) 的详情，请参阅[我们的文档站点](https://caddyserver.com/docs/)。

Caddy 几乎所有的配置都包含在一个配置文档中，而不是像其他 Web 服务器那样分散在 CLI 参数、环境变量和一个配置文件中。这让服务器配置的管理更加直观，并减少了隐藏变量/因素。


## 完整文档

我们的官网提供完整文档：

**https://caddyserver.com/docs/**

文档本身也是开源的。你可以在这里为其做出贡献：https://github.com/caddyserver/website



## 获取帮助

- 我们建议在使用 Caddy 的公司，在需要帮助之前先通过 [Ardan Labs](https://www.ardanlabs.com) 签订支持合同。

- [赞助](https://github.com/sponsors/mholt) 意义重大！我们可以为赞助者提供私下帮助。如果 Caddy 正在为你的公司带来价值，请考虑赞助。这不仅有助于资助全职工作以确保项目的长久发展，也为你的公司提供所需的资源、支持与折扣；同时也是向你的客户及潜在客户展示公司形象的好方式！

- 个人用户可以免费在我们的社区论坛交流帮助：https://caddy.community。请记住，大家的帮助都出于业余时间和善意。获得帮助的最好方式，就是先付出帮助！

请仅在 [issue 跟踪器](https://github.com/caddyserver/caddy/issues) 中提交 bug 报告和功能请求等有明确指向的开发事项（支持类问题通常会被引导至论坛）。



## 关于

Matthew Holt 于 2014 年在杨百翰大学（Brigham Young University）攻读计算机科学时开始开发 Caddy。（之所以取名「Caddy」，是因为这款软件能帮助处理托管 Web 那些繁琐、乏味的任务，同时也是把多件事物集中组织在一起的地方。）它很快成为第一个自动且默认使用 HTTPS 的 Web 服务器，如今已有数百名贡献者，并服务了数万亿次 HTTPS 请求。

**「Caddy」是注册商标。** 该软件的名称为「Caddy」，而非「Caddy Server」或「CaddyServer」。请称其为「Caddy」，或者如果你想澄清，称其为「Caddy Web 服务器」。Caddy 是 Stack Holdings GmbH 的注册商标。

- _项目在 X 上：[@caddyserver](https://x.com/caddyserver)_
- _作者在 X 上：[@mholt6](https://x.com/mholt6)_

Caddy 是 [ZeroSSL](https://zerossl.com)（HID Global 旗下公司）的一个项目。

Debian 软件包仓库托管由 [Cloudsmith](https://cloudsmith.com) 慷慨提供。Cloudsmith 是唯一完全托管、云原生的通用软件包管理解决方案，能让你的组织以完全的信心，创建、存储并共享任意格式、至任意位置的软件包。
