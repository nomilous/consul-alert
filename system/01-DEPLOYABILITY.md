# System Setup (Deployability For This App)

3 x ubuntu 14:04, 2 Gig RAM (1 Gig probably ok)

All instructions should be applied to all 3 hosts unless otherwise specified.

## Create deployability for this app.

* App is deplyed into and run from /home/monitor
* The deployment is done with a direct git push in the git repo in /home/monitor/git
* The git repo has a post update hook to extract and restart the app




### Create the "deamon" user

```bash
adduser monitor --disabled-password
su monitor
cd ~
mkdir .ssh
vi .ssh/authorized_keys
# add your public ssh key to allow login (for git push)
```



### Create a bare git repo to push into

```bash
# as root
apt-get update
apt-get install git

su monitor
cd ~
mkdir git
cd git
git init --bare
```



### Install NodeJS

* How to install nodejs keeps changing. See here: [https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/)




### Install Foreman

* Uses foreman (nf) to generate upstart scripts from `Procfile` and `.env`

```bash
npm install foreman -g
```



### Configure sudo for monitor (daemon user)

* Uses sudo to allow write into /etc/init/ by foreman (nf) in githook
* And also to allow the githook to restart the service

```bash
3 as root
touch /etc/sudoers.d/monitor
chmod 644 /etc/sudoers.d/monitor
vi /etc/sudoers.d/moniitor
```
copy from `./etc/sudoers.d/monitor` in this repo



### Create git hook that extracts, installs and re-starts service

```bash
su monitor
cd ~
touch git/hooks/post-update
chmod +x git/hooks/post-update
vi git/hooks/post-update
```
copy from `./home/monitor/git/hooks/post-update



### Deply to each server

* Push this git clone into the deployment repo at each server.
* Substitute hosts accordingly

```bash
git push monitor@consul1:git master
git push monitor@consul2:git master
git push monitor@consul3:git master
```
