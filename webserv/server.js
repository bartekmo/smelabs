const Koa = require('koa');
const app = new Koa();

const axios = require('axios');

function generateHtml( outputData ) {
  var outputTxt = '';
  for (const outputPair of outputData ) {
    outputTxt += '<tr><td>'+outputPair.label+'</td><td>'+outputPair.data+'</td></tr>'
  }


  return `<!doctype html>
<html>
<head>
<!-- Compiled and minified CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.0/css/materialize.min.css">
<!-- Compiled and minified JavaScript -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.0/js/materialize.min.js"></script>
<title>Blah...</title>
</head>
<body>
<div class="container">
<div class="row">
<div class="col s2">&nbsp;</div>
<div class="col s8">
<div class="card blue">
<div class="card-content white-text">
<div class="card-title">Your data</div>
</div>
<div class="card-content white">
<table class="bordered">
  <tbody>
` +outputTxt+ `
  </tbody>
</table>
</div>
</div>
<div class="col s2">&nbsp;</div>
</div>
</div>
</html>`;
}

app.use( async (ctx, next) => {
  ctx.state.output = new Array();

  await next();
  ctx.body = generateHtml( ctx.state.output );
})

app.use( async (ctx, next) => {
  await next();
  return axios.get( "http://metadata.google.internal/computeMetadata/v1/instance/hostname", {timeout:500, headers:{ "Metadata-Flavor": "Google"}})
    .then( async (res) => {
	ctx.state.output.push({label: "Webserver hostname", data: res.data})	
    })
    .catch( err => {
      console.log( 'Cannot connect to metadata. '+err );
    })
})

app.use( async (ctx, next) => {
  await next();
  return axios.get( "http://10.0.2.2/", {timeout:500})
	.then( res => {
	  ctx.state.output.push({label: "Backend reacheable", data: "YES" });
	})
	.catch( err => {
	  ctx.state.output.push({label: "Backend reacheable", data: '<div style="font-weight: bold; color: red;">NO</div>' });
	})
})

app.use( async ctx => {
  return axios.get('http://api.ipify.org', {timeout: 10000})
	.then( response => {
    	ctx.state.output.push({label:'Server egress IP', data: response.data});
  	})
	.catch( err => {
	console.log( 'Cannot connect to ipify.'+err );
	})

});


app.listen( 8080 );
