export interface Installer {
  id: string;
  label: string;
  code: string;
  /** 该方式附带的说明 */
  note: string;
}

export const INSTALLERS: Installer[] = [
  {
    id: 'debian',
    label: 'Debian / Ubuntu',
    code: `sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \\
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \\
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy`,
    note: '官方包会自动以名为 caddy 的 systemd 服务启动运行。',
  },
  {
    id: 'rpm',
    label: 'Fedora / RHEL',
    code: `# Fedora
sudo dnf install dnf5-plugins
sudo dnf copr enable @caddy/caddy
sudo dnf install caddy

# CentOS / RHEL
sudo dnf install dnf-plugins-core
sudo dnf copr enable @caddy/caddy
sudo dnf install caddy`,
    note: '包内带有 systemd 单元文件，默认未启用，建议启用后使用。',
  },
  {
    id: 'macos',
    label: 'macOS',
    code: `brew install caddy`,
    note: '由社区维护的 Homebrew formula。',
  },
  {
    id: 'windows',
    label: 'Windows',
    code: `# Chocolatey
choco install caddy

# Scoop
scoop install caddy

# Webi
curl.exe https://webi.ms/caddy | powershell`,
    note: '均为社区维护。可能需要调整防火墙规则以允许非本机连接。',
  },
  {
    id: 'docker',
    label: 'Docker',
    code: `docker run -d --name caddy \\
  -p 80:80 -p 443:443 -p 443:443/udp \\
  -v ./Caddyfile:/etc/caddy/Caddyfile \\
  -v caddy_data:/data \\
  caddy`,
    note: 'caddy_data 卷用于存放证书，务必持久化，否则会反复触发签发。',
  },
  {
    id: 'binary',
    label: '静态二进制',
    code: `# 从 GitHub Releases 下载后放进 PATH
curl -o caddy https://github.com/caddyserver/caddy/releases/latest
chmod +x caddy
sudo mv caddy /usr/local/bin/

caddy version`,
    note: '没有运行时依赖，甚至可以不需要 libc。生产环境更推荐用发行版官方包。',
  },
  {
    id: 'other',
    label: '其他',
    code: `# Arch Linux / Manjaro
sudo pacman -Syu caddy

# Nix
nix-env -iA nixpkgs.caddy

# 带插件自建
xcaddy build v2.10.0 \\
  --with github.com/caddy-dns/cloudflare`,
    note: '官方包只含标准模块，需要第三方插件时用 xcaddy 构建。',
  },
];
