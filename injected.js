function injected_main() {

    var ipRegex = /^78\.81\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/igm;

    var BRASipRegex = /^78\.81\.224\.66$/igm;

    var vlanRegex = /^vlan(\d{1,4})\/.*\//;

    var BRASRegex = /^pskov-nas(-\d)*$/;

    var wordRegex = /^Дата\sэаключения:$/i;

    var macRegex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/igm;

    // Получаем все ваще
    var str = document.getElementsByTagName('td');

    // Бывает так, что абоненту обнулили MAC
    // Что бы не смущать оператора обходим это прописыванием нулевого MAC-а
    // После этого скрипт не сломается
    var gmac = '00:00:00:00:00:00';
    for(var tcounter=0; tcounter<str.length; tcounter++)
    {
        // Находим IP
        if(str[tcounter].innerHTML.match(ipRegex) && !str[tcounter].innerHTML.match(BRASipRegex))
        {
            str[tcounter].style.color = 'magenta';
            var gip = str[tcounter].innerHTML;
        }

        // Находим MAC 

        
        if(str[tcounter].innerHTML.match(macRegex))
        {
            str[tcounter].style.color = 'magenta';
            // Если MAC удалось найти заменяим им нулевой MAC 
            // Заданный за перделами цикла
            gmac = str[tcounter].innerHTML;
        }

        // Находим VLAN
        if(str[tcounter].innerHTML.match(vlanRegex))
        {
          var vlan = str[tcounter].innerHTML.replace(/\//g,'').split('vlan');
          if( ((vlan[2] !== "") && (vlan[2] !== undefined) ) || (vlan[2] == vlan[1]))
          {
            var gvlan = vlan[2];
          }
          else
          {
            var gvlan = vlan[1];
          }

        }
    }

// Формируем URL и делаем GET запрос
gurl = 'http://10.165.49.5/datahelper.php?gip=' + gip + '&gmac=' + gmac + '&gvlan=' + gvlan;

console.log(gurl);

var gxnr = new XMLHttpRequest();
gxnr.open("GET", gurl, true); // тут происходит ГЕТ запрос на указанную страницу

gxnr.onreadystatechange = function()
{
  if (gxnr.readyState == 4) // если всё прошло хорошо, выполняем, что в скобках  
  {
    // Преобразуем полученыё JSON в объект
    datainfo = JSON.parse(gxnr.responseText);

    // Опять получаем все вообще
    var str = document.getElementsByTagName('td');

    for(var tcounter=0; tcounter<str.length; tcounter++)
    {
      // Находим и подсвечиваем IP
      if(str[tcounter].innerHTML.match(ipRegex) && !str[tcounter].innerHTML.match(BRASipRegex) && !datainfo.IP &&
          (datainfo.BRASES[0] !== 'undefined' || // Fuck! Надо разобраться почему иначе не работает
           datainfo.BRASES[1] !== undefined ||
           datainfo.BRASES[2] !== undefined ||
           datainfo.BRASES[3] !== undefined))
      {
          str[tcounter].style.color = 'green';
      }

      // Находим и подсвечиваем MAC
      if(str[tcounter].innerHTML.match(macRegex) && datainfo.MAC.status == 'on_line')
      {
        str[tcounter].style.color = 'green';
      }
 
      // Находим и подсвечиваем BRAS
      if(str[tcounter].innerHTML.match(BRASRegex) &&
         (str[tcounter].innerHTML == datainfo.BRASES[0] ||
          str[tcounter].innerHTML == datainfo.BRASES[1] ||
          str[tcounter].innerHTML == datainfo.BRASES[2] ||
          str[tcounter].innerHTML == datainfo.BRASES[3]))
      {
        str[tcounter].style.color = 'green';
      }

      // Выводим инфо для оператора
      if(str[tcounter].innerHTML.match(wordRegex))
      {
        var newDiv = document.createElement('div');
        newDiv.style.color = 'green';
        newDiv.style.textAlign = 'left';


        if((datainfo.MAC.vendor !== undefined || datainfo.MAC.vendor !== '') && gmac !== '00:00:00:00:00:00'){newDiv.innerHTML = 'Устройство абоннета <b>' + datainfo.MAC.vendor + '</b><br>';}
        //if(datainfo.MAC.vlan !== undefined){ newDiv.innerHTML = newDiv.innerHTML + 'VLAN <b>' + datainfo.MAC.vlan + '</b><br>';}
        //if(datainfo.MAC.port !== undefined){ newDiv.innerHTML = newDiv.innerHTML + 'Порт <b>' + datainfo.MAC.port + '</b><br>';}
        //if(datainfo.MAC.district !== undefined){ newDiv.innerHTML = newDiv.innerHTML + 'Район <b>' + datainfo.MAC.district + '</b><br>';}


        if(datainfo.BRASES)
        {
          if(datainfo.BRASES.length > 1) { newDiv.innerHTML = newDiv.innerHTML + '<span style="color:magenta"><br><strong>ВНИМАНИЕ!</strong><br> Найдено ' + datainfo.BRASES.length + ' сессии!<br>Необходимо убить все сессии и перезапустить кваггу на выделенных <b style="color:green;">зелёненьким</b> BRAS-ах!<br>Сообщите кому нибудь в кабинете <b>525</b> об этом.</span>';}
        }

        //Выясняем сколько абоненту необходимо внести
        var debt = document.getElementsByClassName("debt");
        var balance = document.getElementsByClassName("balance");


        if(datainfo.BRASES !== undefined && debt[0].innerHTML > 0)
        {
          newDiv.innerHTML = newDiv.innerHTML + '<br><span style="color:blue;"><b>ВНИМАНИЕ!!!</b><br>Абонент подключен с IP 10.81.x.x <b> так как недостаточно средств</b> </span><br>';
        }

        if(debt[0].innerHTML > 0)
        {
          newDiv.innerHTML = newDiv.innerHTML + '<span style="color:blue;">Что бы у абонента появилась возможность пользоваться интернетом ему необходимо внести на счёт <b>' + (debt[0].innerHTML - balance[0].innerHTML) +' р.</b></span>';
        }

        if(datainfo.BRASES !== undefined && datainfo.MAC.status !== 'on_line' && gmac !== '00:00:00:00:00:00')
        {
          newDiv.innerHTML = newDiv.innerHTML + '<br><span style="color:blue;"><b>ВНИМАНИЕ!!!</b><br>Абонент подключен с IP 10.81.x.x <b> так как cменил оборудование</b> </span><br>';
        }

        str[tcounter].innerHTML = '';
        str[tcounter].appendChild(newDiv);
      }
    }
  }
}

gxnr.send();

}