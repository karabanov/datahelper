var script_url = chrome.extension.getURL('/injected.js');


var xhr = new XMLHttpRequest();
xhr.open("GET", script_url, true); // тут происходит ГЕТ запрос на указанную страницу

xhr.onreadystatechange = function()
{
  if (xhr.readyState == 4) // если всё прошло хорошо, выполняем, что в скобках  
  {
    //console.log(xhr.responseText);

    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');

    script.innerHTML = xhr.responseText;

    document.head.appendChild(script);
    document.body.setAttribute("onClick", "injected_main();");
  }
}

xhr.send();

console.log('inject success');



/*



console.log("regex");

var ipRegex = '/(d{1,3}.d{1,3}.d{1,3}.d{1,3})/g';  

var matches = $('body').text().replace(ipRegex , '<i>$1</i>');

$('body').css("color","red");

console.log(matches);*/
