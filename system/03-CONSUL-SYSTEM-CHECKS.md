# System Setup (Configure consul to perform basic system checks)

3 x ubuntu 14:04, 2 Gig RAM (1 Gig probably ok)

All instructions should be applied to all 3 hosts unless otherwise specified.

## Hijack plugins from nagios

* Install useful nagios plugins into `/usr/local/share/monitoring`
* Get tarball link (for wget) from here [https://www.nagios.org/downloads/nagios-plugins/](https://www.nagios.org/downloads/nagios-plugins/)

```bash
# as root
cd ~
wget http://www.nagios-plugins.org/download/nagios-plugins-2.1.1.tar.gz
tar -zxf nagios-plugins-2.1.1.tar.gz
apt-get install build-essential

cd nagios-plugins-2.1.1
./configure
make

mkdir /usr/local/share/monitoring
find plugins/ -type f -executable | while read file; do cp $file /usr/local/share/monitoring; done
find plugins-scripts/ -type f -executable | while read file; do cp $file /usr/local/share/monitoring; done
find plugins-root/ -type f -executable | while read file; do cp $file /usr/local/share/monitoring; done

```

## Install check_mem

Couldn't find the plugin for this. So wrote it in nodejs. Obviously using a nodejs script for checking memory does not make that much sence...

```bash
touch /usr/local/share/monitoring/check_mem
chmod 755 /usr/local/share/monitoring/check_mem
vi /usr/local/share/monitoring/check_mem
```

* copy from `./usr/local/share/monitoring/check_mem`


## Config consul to perform system checks

```bash
vi /etc/consul.d/server/10-system-checks.json
```
* copy from `./etc/consul.d/server/10-system-checks.json`

suggested values for loadAverage thresholds

```
But start with something in the ranges of

1 min load avg:
w: <ncpu> * 8
c: <ncpu> * 10

5 min load avg:
w: <ncpu> * 5
c: <ncpu> * 8

15 min load avg:
w: <ncpu> * 2
c: <ncpu> * 3
and adjust for each server, so you get notifications when it makes sense for the particular server.

For example, a server with 4 CPU cores, it would read as follows: check_load -w 32,20,8 -c 40,32,12

```

## HUP to reload each consul server



