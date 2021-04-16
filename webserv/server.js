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
  await next();
  console.log( ctx.state.output );
  ctx.body = generateHtml( ctx.state.output );
})

app.use( async ctx => {
  return axios.get('http://api.ipify.org', {timeout: 10}).then( response => {
    if (!("output" in ctx.state )) {
      console.log( 'init output');
      ctx.state.output = new Array();
    }
    ctx.state.output.push({label:'Public IP', data: response.data});
  })
  //ctx.body = "hello world";
});


app.listen( 8080 );
