# consul-monitor

Ongoing Development (Discovery of [consul](https://www.consul.io/))

* This is a monitoring service.
* It serves only to alert when there is a problem.
* It does not keep a browsable history (of graphs) for further analysis.

See `system/` for system setup (consul, deployment of __this__)

See `bin/monitor` for the node process that runs on each consul cluster server and is responsible for sending alerts when services are warning or alerting.

