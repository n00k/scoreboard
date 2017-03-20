/***************************************
*  To change the scoreboard picture:
*  replace the scoreboard.bmp file
*  then adjust the following scoreboard 
*  configuration variables.
*  All numeric values should be number
*  of pixels.  Arrays should be 
*  left, top, bottom, right coordinates
*  of the specified area in the picture
***************************************/


//size of the scoreboard picture, in pixels
var boardheight = 533
var boardwidth  = 917

//location of main clock within scoreboard
//array of left,top,right,bottom in pixels
var mainclockloc = new Array(322,29,584,125)

//location of period with scoreboard
var periodloc = new Array(500,168,543,244)

//location of home/away score
var homescoreloc = new Array(133,124,249,222)
var awayscoreloc = new Array(725,124,841,222)

//number of penalty timer slots per team on the scoreboard (0 to 4)
var numpenalty = 2

//number of penalty timers per team allowed to count simultaneously (0 to 4)
var numpentimers = 2

//location of penalty timers (2 dimensional array)
var homepenaltyloc = new Array(Array(75,320,235,400),Array(75,420,235,500),Array(75,520,235,600),Array(75,620,235,700))
var awaypenaltyloc = new Array(Array(675,320,835,400),Array(675,420,835,500),Array(675,520,835,600),Array(675,620,835,700))

//show player number with penalty timer (T/F)
var penaltyplayer = false

//location of player penalty numbers (if present) (2 dimensional array)
var homepenaltyplrloc = new Array(Array(210,207,280,257),Array(210,274,280,324),Array(210,341,280,391),Array(210,408,280,458))
var awaypenaltyplrloc = new Array(Array(680,207,750,257),Array(680,274,750,324),Array(680,341,750,391),Array(680,408,750,458))

/**********************************
*
*  End of scoreboard configuration
*
***********************************/


//size of the controller screen, in pixels
var screenht = 61
var screenwd = 290

//initialize global variables
var initialized = false
var homepenalty = new Array(Array(false,0,0,0),Array(false,0,0,0),Array(false,0,0,0),Array(false,0,0,0))
var awaypenalty = new Array(Array(false,0,0,0),Array(false,0,0,0),Array(false,0,0,0),Array(false,0,0,0))
var mainperiodmin = 20
var mainperiodsec = 0
var mainbreakmin = 8
var mainbreaksec = 0
var mainotmin = 10
var mainotsec = 0
var timeoutmin = 0
var timeoutsec = 0
var timeoutfullmin = 1
var timeoutfullsec = 0
var timeoutpartmin = 0
var timeoutpartsec = 20
var mainmin = 20
var mainsec = 0
var maintenth = 0
var maindir = 'DOWN'
var majorpenmin = 5
var majorpensec = 0
var minorpenmin = 2
var minorpensec = 0
var homescore = 0
var awayscore = 0
var period = 1
var homescore
var awayscore
var maintimerid = 0
var totimerid = 0
var cleartimerid = 0
var inbuffer = "__"
var screentext
var penaltynum
var penaltyside
var penaltyplr
var lastbutton = "none"
var autohorn = true
var poweroff = true
var mode = ""
var tenth = false
var penable = true
var state = 'off'
var prevstate

/*
* Possible states:
*
* main - normal operating state
* off - unit is off
* poweron - powering on, pre-selftest
* selftest
* resume - resume prompt
* sportcode - enter sport code prompt
* radio - radio settings prompt
* lamptestprompt - accept to begin
* lamptest - all lights on
* editperiod
* newpenalty
* editpenalty
* editpenaltytime
* selectpenalty
* mainclockset
* mainclockperiod
* mainclockbreak
* mainclockot
* editfullto
* editpartto
* newgame
* newsport
* timeoutfull
* timeoutpart
* timeoutrun
*/


//this area for testing
homepenalty[0][0] = true
homepenalty[0][1] = "2"
homepenalty[0][2] = "30"
homepenalty[0][3] = "30"
homepenalty[1][0] = true
homepenalty[1][1] = "0"
homepenalty[1][2] = "30"
homepenalty[1][3] = "35"
awaypenalty[0][0] = true
awaypenalty[0][1] = "0"
awaypenalty[0][2] = "10"
awaypenalty[0][3] = "10"
awaypenalty[1][0] = true
awaypenalty[1][1] = "5"
awaypenalty[1][2] = "0"
awaypenalty[1][3] = "20"
awaypenalty[2][0] = true
awaypenalty[2][1] = "2"
awaypenalty[2][2] = "0"
awaypenalty[2][3] = "15"
//end of test area

function makeelement(kind, id, x, y, h, w, html)
{
 el=document.createElement(kind)
 el.setAttribute('id', id)
 el.style.position='absolute'
 el.style.left=x
 el.style.top=y
 el.style.height=h
 el.style.width=w
 if (html != '') {
   el.innerHTML=html
 }
 return el
}

function selftest()
{
 if (state == 'poweron')
 {
  setscreen("AS-3100 V1.0.0<br>ED-12107")
  state = 'selftest'
  setTimeout('selftest()', 3000)
 } else {
  setscreen("PREV CODE 04<BR>ENTER TO RESUME")
  state = 'resume'
 }
}

function power(sw)
{
 if (sw == 'off')
 {
  document.getElementById('pwr').src = 'images/pwroff.bmp
  poweroff = true
  setscreen("&nbsp;")
  if (maintimerid) stopclock()
  scoreboard=document.getElementById('boarddiv')
  for(i = 0 ; i < scoreboard.childNodes.length ; i++)
  {
   if (scoreboard.childNodes[i].id != 'board') scoreboard.childNodes[i].style.visibility = 'hidden'
  }
  state = 'off'
 } else {
  document.getElementById('pwr').src = 'images/pwron.bmp
  state = 'poweron'
  if (maintimerid) stopclock()
  clearboard()
  scoreboard=document.getElementById('boarddiv')
  for(i = 0 ; i < scoreboard.childNodes.length ; i++)
  {
   if (scoreboard.childNodes[i].id != 'board') scoreboard.childNodes[i].style.visibility = 'visible'
  }
  selftest()
  poweroff = false
 }
}

function scoreedit(side)
{
 state = 'scoreedit'
 penaltyside = side
 if (side == 'HOME') score = "" + homescore; else score = "" + awayscore
 screentext = "TEAM score-edit<br>" + side + "  #1#2"
 inbuffer = "000"
 while (score.length < 3) score = "0" + score
 for(i = 0; i < score.length; i++) numberpress(score.substr(i,1))
}

function scoreadj(side, adjust)
{
 sign=""
 if (adjust > 0) sign="+"
 if (side == 0) 
 {
  homescore = homescore + adjust
  if (homescore < 0) homescore = 0
  setscreen("TEAM SCORE-" + sign + adjust + "<br>HOME " + homescore)
 } else {
  awayscore = awayscore + adjust
  if (awayscore < 0) awayscore = 0
  setscreen("TEAM SCORE-" + sign + adjust + "<br>AWAY " + awayscore)
 }
 display()
 cleartimerid = setTimeout('setscreen("&nbsp;")',10000)
}

function startclock()
{
 delay = 1000
 if (tenth) delay = 100
 if (!maintimerid) maintimerid = setInterval('clocktick()',delay)
}

function stopclock()
{
 clearInterval(maintimerid)
 maintimerid = 0
}

function clocktick()
{
	if (state == 'timeoutrun') {
		timeoutsec = timeoutsec - 1;
		if (timeoutsec < 0) {
			timeoutsec = 59;
			timeoutmin = timeoutmin - 1;
		} 
		var sec = "" + timeoutsec;
		if (sec.length < 2) sec = "0" + sec;
		screentext = "Time Out<br>" + timeoutmin + ":" + sec;
		setscreen(screentext);
		if (timeoutmin == 0 && timeoutsec == 0) {
			if (autohorn) document.getElementById("hornwav").play();
			clearInterval(maintimerid);
			maintimerid = 0;
			setscreen("&nbsp;");
			state = 'main';
		}
	} else {
		if (tenth)
		{
			alert("Timer running and tenth true");
		} else {
			if (maindir == 'DOWN')
			{
				mainsec = mainsec - 1;
				if (mainsec < 0)
				{
					mainsec = 59;
					mainmin = mainmin - 1;
				} else if (mainmin == 0 && mainsec == 0 && (maintenth == 0 || tenth == false))
				{
					if (autohorn) document.getElementById("hornwav").play();
					clearInterval(maintimerid);
					maintimerid = 0;
				}   
			} else {
				mainsec = mainsec + 1;
				if (mainsec > 59)
				{
					mainsec = 0;
					mainmin = mainmin + 1;
					if (mainmin > 99) mainmin = 0;
				}
			}
		}
		if (penable) penaltytick();
		display();
	}
}

function penaltytick()
{
 for(i = 0 ; i < numpentimers ; i++)
 {
   tickpenalty(homepenalty[i]);
   tickpenalty(awaypenalty[i]);
 }
 while (!(homepenalty[0][0] && homepenalty[1][0]) && (homepenalty[2][0] || homepenalty[3][0])) { promote(homepenalty); }
 while (!(awaypenalty[0][0] && awaypenalty[1][0]) && (awaypenalty[2][0] || awaypenalty[3][0])) { promote(awaypenalty); }
}

function tickpenalty(penalty)
{
   if (penalty[0]) 
   {
    penalty[2] = penalty[2] - 1
    if (penalty[2] < 0)
    {
     penalty[2] = 59
     penalty[1] = penalty[1] - 1
    }
    if (penalty[2] == 0 && penalty[1] == 0)
    {
      penalty[0] = false
    }
   } else {
    penalty[1] = 0
    penalty[2] = 0  
   }
}
    
function promote(penarr)
{
	topsort(penarr);
	bottomsort(penarr);
     var hold = penarr[1];
	penarr[1] = penarr[2];
	penarr[2] = hold;
}

function topsort(penarr)
{
	if (comppenalty(penarr[0], penarr[1]) > 0)
	{
		var hold = penarr[1];
		penarr[1] = penarr[0];
		penarr[0] = hold;
	}
}

function bottomsort(penarr)
{
 	if (comppenalty(penarr[2], penarr[3]) > 0)
	{
		var hold = penarr[2];
		penarr[2] = penarr[3];
		penarr[3] = hold;
	} 
}

function comppenalty(a,b)
{
 if (a[0] || b[0])
 {
  if (!a[0]) return 1;
  if (!b[0]) return -1;
  return 0;
/*
  if (a[1] != b[1])
  {
   return b[1] - a[1]
  } else {
   if (a[2] != b[2])
   {
    return b[2] - a[2]
   } else {
    return b[3] - a[3]
   }
  }
  */
 } else {
  return 0
 }
}

function enablepenalty(enable)
{
 penable = enable
}

function setscreen(msg)
{
 if (cleartimerid)
 {
  clearTimeout(cleartimerid)
  cleartimerid = 0
 }
 document.getElementById('acceptdiv').style.visibility = 'hidden'
 document.getElementById('scrn').innerHTML = msg
}

function initialize()
{
 if (initialized) { return }
 initialized = true 
 document.getElementById('sorry').innerHTML="<center>Loading ... Please Wait</center>"
 var boarddiv=makeelement("div", 'boarddiv', 0, 0, "auto", "auto", '')
 boarddiv.appendChild(makeelement("div", 'board', 0, 0, boardheight, boardwidth,"<img src='images/scoreboard.bmp>"))
 hmht = homescoreloc[3] - homescoreloc[1]
 hmwd = homescoreloc[2] - homescoreloc[0]
 hmchwd = parseInt(hmwd / 5,10)
 boarddiv.appendChild(makeelement("div", 'homescore', homescoreloc[0],homescoreloc[1],hmht,hmwd,"<img id='hmten' height=" + hmht + " width=" + (hmchwd * 2) + " src='images/blank.gif><img height=" + hmht + " width=" + hmchwd + " src='images/blank.gif><img id='hmone' height=" + hmht + " width=" + (hmchwd * 2) + " src='images/blank.gif>"))
 hmht = awayscoreloc[3] - awayscoreloc[1]
 hmwd = awayscoreloc[2] - awayscoreloc[0]
 hmchwd = parseInt(hmwd / 5,10)
 boarddiv.appendChild(makeelement("div", 'awayscore', awayscoreloc[0],awayscoreloc[1],hmht,hmwd,"<img id='awten' height=" + hmht + " width=" + (hmchwd * 2) +  " src='images/blank.gif><img height=" + hmht + " width=" + hmchwd + " src='images/blank.gif><img id='awone' height=" + hmht + " width=" + (hmchwd * 2) + " src='images/blank.gif>"))
 if (numpenalty > 4) numpenalty=4
 if (numpenalty < 1) numpenalty=0
 for(i=0;i<numpenalty;i++)
 {
  //home penalty timer
  pnht = homepenaltyloc[i][3] - homepenaltyloc[i][1]
  pnwd = homepenaltyloc[i][2] - homepenaltyloc[i][0]
  pnchwd = parseInt(pnwd / 11,10)
  pnhtml = "<img id='h" + i + "mten' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif><img height=" + pnht + " width=" + pnchwd + " src='images/blank.gif>"
  pnhtml = pnhtml + "<img id='h" + i + "mone' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif>"
  pnhtml = pnhtml + "<img height=" + pnht + " width=" + pnchwd + " src='images/colono.bmp>"
  pnhtml = pnhtml + "<img id='h" + i + "sten' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif><img height=" + pnht + " width=" + pnchwd + " src='images/blank.gif>"
  pnhtml = pnhtml + "<img id='h" + i + "sone' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif>"
  boarddiv.appendChild(makeelement("div", 'h' + i + 'pen', homepenaltyloc[i][0],homepenaltyloc[i][1],pnht,pnwd, pnhtml))
  //away penalty timer
  pnht = awaypenaltyloc[i][3] - awaypenaltyloc[i][1]
  pnwd = awaypenaltyloc[i][2] - awaypenaltyloc[i][0]
  pnchwd = parseInt(pnwd / 11,10)
  pnhtml = "<img id='a" + i + "mten' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif><img height=" + pnht + " width=" + pnchwd + " src='images/blank.gif>"
  pnhtml = pnhtml + "<img id='a" + i + "mone' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif>"
  pnhtml = pnhtml + "<img height=" + pnht + " width=" + pnchwd + " src='images/colono.bmp>"
  pnhtml = pnhtml + "<img id='a" + i + "sten' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif><img height=" + pnht + " width=" + pnchwd + " src='images/blank.gif>"
  pnhtml = pnhtml + "<img id='a" + i + "sone' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif>"
  boarddiv.appendChild(makeelement("div", 'a' + i + 'pen', awaypenaltyloc[i][0],awaypenaltyloc[i][1],pnht,pnwd, pnhtml))
  
  if (penaltyplayer) 
  { 
   //home penalty player number
   pnht = homepenaltyplrloc[i][3] - homepenaltyplrloc[i][1]
   pnwd = homepenaltyplrloc[i][2] - homepenaltyplrloc[i][0]
   pnchwd = parseInt(pnwd / 5,10)
   pnhtml = "<img id='hp" + i + "ten' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif><img height=" + pnht + " width=" + pnchwd + " src='images/blank.gif>"
   pnhtml = pnhtml + "<img id='hp" + i + "one' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif>"
   boarddiv.appendChild(makeelement("div", 'hp' + i + 'pen', homepenaltyplrloc[i][0],homepenaltyplrloc[i][1],pnht,pnwd, pnhtml))
   //away penalty player number
   pnht = awaypenaltyplrloc[i][3] - awaypenaltyplrloc[i][1]
   pnwd = awaypenaltyplrloc[i][2] - awaypenaltyplrloc[i][0]
   pnchwd = parseInt(pnwd / 5,10)
   pnhtml = "<img id='ap" + i + "ten' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif><img height=" + pnht + " width=" + pnchwd + " src='images/blank.gif>"
   pnhtml = pnhtml + "<img id='ap" + i + "one' height=" + pnht + " width=" + (pnchwd * 2) + " src='images/blank.gif>"
   boarddiv.appendChild(makeelement("div", 'hp' + i + 'pen', awaypenaltyplrloc[i][0],awaypenaltyplrloc[i][1],pnht,pnwd, pnhtml))
  }
 }
 ckht = mainclockloc[3] - mainclockloc[1]
 ckwd = mainclockloc[2] - mainclockloc[0]
 ckchwd = ckwd / 13
 clkhtml = "<img id='clkmten' height=" + ckht + " width=" + (ckchwd * 2) + " src='images/blank.gif><img height=" + ckht + " width=" + ckchwd + " src='images/blank.gif>"
 clkhtml = clkhtml + "<img id='clkmone' height=" + ckht + " width=" + (ckchwd * 2) + " src='images/blank.gif><img height=" + ckht + " width=" + ckchwd + " src='images/blank.gif>"
 clkhtml = clkhtml + "<img height=" + ckht + " width=" + ckchwd + " src='images/colong.gif><img height=" + ckht + " width=" + ckchwd + " src='images/blank.gif>"
 clkhtml = clkhtml + "<img id='clksten' height=" + ckht + " width=" + (ckchwd * 2) + " src='images/blank.gif><img height=" + ckht + " width=" + ckchwd + " src='images/blank.gif>"
 clkhtml = clkhtml + "<img id='clksone' height=" + ckht + " width=" + (ckchwd * 2) + " src='images/blank.gif>"
 boarddiv.appendChild(makeelement("div", 'mainclk', mainclockloc[0], mainclockloc[1], ckht, ckwd, clkhtml))
 pht = periodloc[3] - periodloc[1]
 pwd = periodloc[2] - periodloc[0]
 boarddiv.appendChild(makeelement("div", "perioddiv", periodloc[0], periodloc[1], pht, pwd,"<img id='period' height=" + pht + " width=" + pwd + " src='images/blank.gif>"))

 var screendiv=makeelement("div", 'screendiv', 0, boardheight + 10, "auto", "auto", "<img id='pwr' src='images/pwroff.bmp height='" + screenht + "' width='" + screenht + "' onclick='javascript:pressbutton(" + '"Power Button"' + ");'>")
 scrn = makeelement("div", 'scrn', parseInt((boardwidth-screenwd)/2,10), 0, screenht, screenwd, "&nbsp;")
 scrn.style.background = '#707070'
 scrn.style.fontSize=parseInt((screenht-10)/2 * 10,10)/10
 scrn.style.fontFace='arial'
 acceptdiv = makeelement("div", 'acceptdiv', parseInt((boardwidth-screenwd)/2,10), 0, screenht, screenwd, 'Enter to accept<br>Clear to modify')
 acceptdiv.style.background = '#707070'
 acceptdiv.style.fontSize=parseInt((screenht-10)/2 * 10,10)/10
 acceptdiv.style.fontFace='arial'
 acceptdiv.style.visibility='hidden'
 screendiv.appendChild(scrn)
 screendiv.appendChild(acceptdiv)
 //image map for keyboard insert
 keymap = "<map name='hockey'>"
 keymap = keymap + "<area href='javascript:test(2);' shape=rect coords='0,0,80,982'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Home Score +1"' + ");' shape=rect coords='83,60,146,123'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Home Score -1"' + ");' shape=rect coords='166,60,229,123'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Home Delete Penalty"' + ");' shape=rect coords='83,143,146,207'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Home Player Penalty"' + ");' shape=rect coords='166,143,229,207'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Home Penalty"' + ");' shape=rect coords='83,227,146,290'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Minor Penalty"' + ");' shape=rect coords='249,60,313,123'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Major Penalty"' + ");' shape=rect coords='333,60,397,123'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Up Arrow"' + ");' shape=rect coords='249,143,313,207'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Down Arrow"' + ");' shape=rect coords='333,143,397,207'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Auto Horn"' + ");' shape=rect coords='249,227,313,290'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Count Up/Down"' + ");' shape=rect coords='333,227,397,290'>"
 horncontrol = "onmousedown='if (state != " + '"off"' +") document.getElementById(" + '"hornwav"' +").play();' onmouseup='if (state != " + '"off"' +") document.getElementById(" + '"hornwav"' +").stop()'"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Manual Horn"' + ");' " + horncontrol + " shape=rect coords='166,305,229,380'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Start"' + ");' shape=rect coords='245,305,320,380'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Stop"' + ");' shape=rect coords='328,305,403,380'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Set Time"' + ");' shape=rect coords='417,305,479,380'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Away Score +1"' + ");' shape=rect coords='500,60,563,123'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Away Score -1"' + ");' shape=rect coords='417,60,479,123'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Away Player Penalty"' + ");' shape=rect coords='417,143,479,207'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Away Delete Penalty"' + ");' shape=rect coords='500,143,563,207'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Away Penalty"' + ");' shape=rect coords='500,227,563,290'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Time Out On/Off"' + ");' shape=rect coords='625,60,689,123'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Enable Penalty Timers"' + ");' shape=rect coords='625,144,689,206'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Disable Penalty Timers"' + ");' shape=rect coords='625,227,689,290'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Period +1"' + ");' shape=rect coords='625,305,689,380'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"0"' + ");' shape=rect coords='834,305,897,380'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"1"' + ");' shape=rect coords='750,227,815,290'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"2"' + ");' shape=rect coords='834,227,897,290'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"3"' + ");' shape=rect coords='917,227,982,290'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"4/Segment"' + ");' shape=rect coords='750,144,815,206'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"5/Lamp Test"' + ");' shape=rect coords='834,144,897,206'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"6/1/10 Sec"' + ");' shape=rect coords='917,144,982,206'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"7/New Game"' + ");' shape=rect coords='750,60,815,123'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"8/Dim"' + ");' shape=rect coords='834,60,897,123'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"9/TOD/Game"' + ");' shape=rect coords='917,60,982,123'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Clear/Alt"' + ");' shape=rect coords='750,305,815,380'>"
 keymap = keymap + "<area href='javascript:pressbutton(" + '"Enter/Edit"' + ");' shape=rect coords='917,305,982,380'>"
 keymap = keymap + "</map>"
 var keydiv=makeelement("div",'keydiv',0,boardheight + screenht + 20,"auto", "auto",keymap + "<img src='images/insert.bmp usemap='#hockey'>")
 document.body.appendChild(boarddiv)
 document.body.appendChild(screendiv)
 document.body.appendChild(keydiv)
 power(state)
 document.getElementById('sorry').innerHTML="&nbsp;"

// Force the horn sound to preload
 var horn = document.getElementById("hornwav")
 if (horn.play) {
	 horn.stop = function() {
		 horn.pause();
		 horn.fastSeek(0);
	 }
	 horn.play();
	 horn.stop();
 } else {
	 horn.play = function() { alert('Horn says Honk')};
	 horn.stop = function() {};
 }
}

function selectpenalty(dirbtn)
{
 if (penaltyside == 'Home') penset = homepenalty; else penset = awaypenalty
 if (prevstate == 'deletepenalty' && !(penset[0][0] || penset[1][0] || penset[2][0] || penset[3][0]))
 {
  state = 'main'
  setscreen('&nbsp;')
 }
 if (dirbtn == 'Enter/Edit')
 {
  if (prevstate == 'editpenalty') 
  {
   min = penset[penaltynum][1]
   sec = penset[penaltynum][2]
   if (min.length < 2) min = "0" + min
   if (sec.length < 2) sec = "0" + sec  
   screentext = penaltyside + " plyr/pen<br>" + (penaltynum + 1) + " p#1#2* pn " + min + ":" + sec
   inbuffer = penset[penaltynum][3]
   if (inbuffer.length < 2) inbuffer = "0" + inbuffer
   setscreen(screentext.replace("#1#2",inbuffer))   
   state = 'editpenalty'
  } else if (prevstate == 'deletepenalty')
  {
   penset[penaltynum][0]=false
   state = 'main'
   setscreen("&nbsp;")
   penset.sort(comppenalty)
   display()
  }
 } else {
  if (dirbtn == 'Up Arrow') dir = -1; else dir = 1
  if ((penaltynum + dir) >= 0 && (penaltynum + dir) < 4)
  {
   if (penset[penaltynum + dir][0])
   {
    state = 'selectpenalty'
    penaltynum = penaltynum + dir
    min = penset[penaltynum][1]
    sec = penset[penaltynum][2]
    penaltyplr = penset[penaltynum][3]
    if (min.length < 2) min = "0" + min
    if (sec.length < 2) sec = "0" + sec
    if (prevstate == 'editpenalty') pentext = " plyr/pen"
    if (prevstate == 'deletepenalty') pentext = " del pen?"
    setscreen(penaltyside + pentext + "<br>" + (penaltynum + 1) + "  p" + penaltyplr + " pn " + min + ":" + sec)
   }
  }
 }
}

function processpenalty()
{
 if (penaltyside == 'Home') penset = homepenalty; else penset = awaypenalty
 if (state == 'main')
  {
        penset.sort(comppenalty)
        state = 'newpenalty'
        i = 0
        while (penset[i][0] == true && i < 4) i++
        min = ""
        if (minorpenmin < 10 ) min = "0"
        sec = ""
        if (minorpensec < 10 ) sec = "0"
        screentext = penaltyside + " plyr/pen<br>" + (i + 1) + " p00  pn " + min + minorpenmin + ":" + sec + minorpensec
        setscreen(screentext)
        penaltynum = i
  } else if (state == 'newpenalty') {
	state = 'editpenalty'
 	i = penaltynum
        screentext = penaltyside + " plyr/pen<br>" + (i + 1) + " p#1#2* pn " + min + minorpenmin + ":" + sec + minorpensec
        inbuffer = "00"
        setscreen(screentext.replace("#1#2",inbuffer))
  } else if (state == 'editpenalty') {
        penaltyplr = inbuffer
        state = 'editpenaltytime'
        screentext = penaltyside + " plyr/pen<br>" + (penaltynum + 1) + " p" + penaltyplr + "&nbsp; pn #1#2*"
        if (penset[penaltynum][0])
        {
         min = penset[penaltynum][1]
         sec = penset[penaltynum][2]
         if (min.length < 2) min = "0" + min
         if (sec.length < 2) sec = "0" + sec
        } else {
         min = minorpenmin
         sec = minorpensec
         if (min < 10) min = "0" + min
         if (sec < 10) sec = "0" + sec
        }  
        inbuffer = (" " + min + sec).substr(1)
        setscreen(screentext.replace("#1#2",inbuffer.substr(0,2) + ":" + inbuffer.substr(2,2)))
  } else if (state == 'editpenaltytime') {
        if (penaltyside == 'Home') pen = homepenalty[penaltynum]
         else pen = awaypenalty[penaltynum]
        pen[0] = true
        pen[1] = inbuffer.substr(0,2)
        pen[2] = inbuffer.substr(2,2)
        pen[3] = penaltyplr
        state = 'main'
        setscreen("&nbsp;")
        display()        
  }

}

function pressbutton(btn)
{
 if (poweroff) 
 {
  if (btn == 'Power Button') power('on')
 } else {
  if (state == 'editsportcode' || (state == 'lamptestprompt' && btn != 'Enter/Edit') || (state == 'newgame' && btn != 'Enter/Edit' && btn != 'Clear/Alt'))
  {
   if (state == 'editsportcode' && btn == 'Enter/Edit') alert("This simulation does not support any other sports.")
   state = 'main'
   setscreen("&nbsp;")
   return
  }
  if (state == 'lamptest') 
  {
   display()
   state = 'main'
   setscreen("&nbsp;")
   return
  }
  if (mode == 'alt')
  {
   switch(btn)
   {
    case '9/TOD/Game':
       break
    case '8/Dim':
       alert("Umm, try using the dimmer control on your monitor.")
       break
    case '7/New Game':
       state = 'newgame'
       setscreen("NEW GAME?<BR>ENTER TO ACCEPT")
       break
    case '6/1/10 Sec':
       break
    case '5/Lamp Test':
       if (!maintimerid) 
       {
        state = 'lamptestprompt'
        setscreen("Lamp test mode<br>Enter to accept")
       }
       break
    case '4/Segment':
       alert("Segment Timer not implemented in this simulator")
       break
   }
   mode = ""
  } else if (mode == 'edit') {
   switch(btn)
   {
    case 'Home Score +1':
    case 'Home Score -1':    
       scoreedit("HOME")
       break
    case 'Away Score +1':
    case 'Away Score -1':
       scoreedit("AWAY")
       break
    case 'Time Out On/Off':
       state = 'editfullto'
       screentext = "TIME Outs -edit<br>FULL  #1#2"
       min = "" + timeoutfullmin
       sec = "" + timeoutfullsec
       if (min.length < 2) min = "0" + min
       if (sec.length < 2) sec = "0" + sec
       buffer = "" + min + sec
       inbuffer = "0000"
       for(i = 0; i < buffer.length; i++) numberpress(buffer.substr(i))
       break
    case 'Period +1':
      state = 'editperiod'
      screentext = "Period-EDIT<br>#1#2"
      buffer = "" + period
      inbuffer = "0"
      for(i = 0; i < buffer.length; i++) numberpress(buffer.substr(i))
      break
    case 'Minor Penalty':
    case 'Major Penalty':
   }
   mode = ""
  } else {
   switch(btn)
   {
    case 'Power Button':
       if (state != 'selftest') power('off')
       break
    case 'Set Time':
       if (!maintimerid && state == 'main')
       {
        state = 'mainclockset'
        screentext = 'MAIN CLOCK -SET<BR>CURR #1#2'
        min = "" + mainmin
        sec = "" + mainsec
        if (min.length < 2) min = "0" + min
        if (sec.length < 2) sec = "0" + sec
        buffer = "" + min + sec + "0"
        inbuffer = "00000"
        for(i = 0; i < 5; i++) numberpress(buffer.substr(i))
       }
       break
    case 'Start':
       if (state == 'main' || state.match(/^timeout/)) startclock()
       break
    case 'Stop':
       if (state == 'main' || state.match(/^timeout/)) stopclock()
       break
    case 'Home Score +1':
       if (state == 'main') scoreadj(0,1)
       break
    case 'Home Score -1':
       if (state == 'main') scoreadj(0,-1)
       break
    case 'Away Score +1':
       if (state == 'main') scoreadj(1,1)
       break
    case 'Away Score -1':
       if (state == 'main') scoreadj(1,-1)
       break
    case 'Enable Penalty Timers':
       if (state == 'main') enablepenalty(true)
       break
    case 'Disable Penalty Timers':
       if (state == 'main') enablepenalty(false)
       break
    case 'Count Up/Down':
       if (state == 'main' && maintimerid == 0)
       {
        state = 'editmaindir'
        setscreen('MAIN CLOCK =' + maindir +"<br>1-UP, 2-DOWN")
       }
       break
    case 'Auto Horn':
       if (state == 'main')
       {
        state = 'autohorn'
        if (autohorn) horn='ON'; else horn='OFF'
        setscreen('AUTO HORN-' + horn + "<br>1-ON, 2-OFF")
       }
       break
    case 'Home Penalty':
    case 'Away Penalty':
       alert("I'm not really sure what that button is supposed to do, so I didn't implement it.")
       break
    case 'Minor Penalty':
       if (state == 'editpenaltytime') 
       {
         if (minorpenmin < 10) min = "0"; else min="";
         if (minorpensec < 10) sec = "0"; else sec="";
         buffer = (" " + min + minorpenmin + sec + minorpensec).substr(1)
         for(i=0;i<4;i++) numberpress(buffer[i])
       } 
       break
    case 'Major Penalty':
       if (state == 'editpenaltytime') 
       {
         if (majorpenmin < 10) min = "0"; else min="";
         if (majorpensec < 10) sec = "0"; else sec="";
         buffer = (" " + min + majorpenmin + sec + majorpensec).substr(1)
         for(i=0;i<4;i++) numberpress(buffer[i])
       } 
       break
    case 'Time Out On/Off':
       switch (state) {
		  case 'main':
			  state = 'timeoutfull';
                 timeoutmin = timeoutfullmin;
			  timeoutsec = timeoutfullsec;
			  var sec = "" + timeoutsec;
			  if (sec.length < 2) sec = "0" + sec;
			  screentext = "TO Length full or part<br>Full  " + timeoutmin + ":" + sec;
			  setscreen(screentext); 
			  break;
		  case 'timeoutfull':
			  state = 'timeoutpart';
                 timeoutmin = timeoutpartmin;
			  timeoutsec = timeoutpartsec;
			  var sec = "" + timeoutsec;
			  if (sec.length < 2) sec = "0" + sec;
			  screentext = "TO Length full or part<br>Part  " + timeoutmin + ":" + sec;
			  setscreen(screentext); 
     		  break;
		  case 'timeoutpart':
			  state = 'main';
			  setscreen("&nbsp;");
			  break;
		  case 'editfullto':
			  state = 'editpartto';
			  screentext = "TIME OUT -edit<br>PARTIAL  #1#2";
			  min = "" + timeoutpartmin;
			  sec = "" + timeoutpartsec;
			  if (min.length < 2) min = "0" + min;
			  if (sec.length < 2) sec = "0" + sec;
			  buffer = "" + min + sec;
			  inbuffer = "0000";
			  for(i = 0; i < buffer.length; i++) numberpress(buffer.substr(i));
	  }
       break;
    case 'Home Player Penalty':
      if (state == 'main')
      {
       prevstate = 'editpenalty'
       penaltyside = 'Home'
       processpenalty()
      }
      break
    case 'Away Player Penalty':
      if (state == 'main')
      {
       prevstate = 'editpenalty'
       penaltyside = 'Away'
       processpenalty()
      }
      break
    case 'Home Delete Penalty':
      if (state == 'main')
      {
       prevstate = 'deletepenalty'
       penaltyside = 'Home'
       penaltynum = 1
       state = 'selectpenalty'
       pressbutton('Up Arrow')
      }
      break
    case 'Away Delete Penalty':
      if (state == 'main')
      {
       prevstate = 'deletepenalty'
       penaltyside = 'Away'
       penaltynum = 1
       state = 'selectpenalty'
       pressbutton('Up Arrow')
      }
      break
    case 'Up Arrow':
    case 'Down Arrow':
      if (state == 'editpenalty' || state == 'selectpenalty') selectpenalty(btn)
      break
    case 'Period +1':
      if (state == 'main' && parseInt(period,10) < 9)
      {
       period = parseInt(period,10) + 1
       setscreen("Period +1<br>" + period)
       display()
       cleartimerid = setTimeout('setscreen("&nbsp;")',10000)
      }
      break
    case 'Enter/Edit':
		 switch (state)
		 {
			 case 'resume':
				 display();
				 state='main';
				 setscreen("");
				 break;
			 case 'sportcode':
				 if (inbuffer != '04') alert("This simulation does not recognize that Sport Code.  Setting Sport Code to 04");
				 setscreen("RADIO SETTINGS<BR>BCAST 1  CHAN 01");
				 maintimerid = setInterval("ad=document.getElementById('acceptdiv'); if (ad.style.visibility == 'hidden') {ad.style.visibility = 'visible'} else {ad.style.visibility = 'hidden'};",1000);
				 state = 'radio';
				 break;
			 case 'radio':
				 if (maintimerid)
				 {
					 clearInterval(maintimerid);
					 maintimerid = 0;
				 }
				 clearboard();
				 resetboard();
				 display();
				 state='main';
				 setscreen("&nbsp;");
				 break;
			 case 'lamptestprompt':
				 setscreen("Lamp test mode<br>Any key to exit");
				 lamptest();
				 state = 'lamptest';
				 break;
			 case 'editperiod':
				 period = inbuffer;
				 setscreen("&nbsp;");
				 state='main';
				 display();
				 break;
			 case 'selectpenalty':
				 selectpenalty(btn);
				 break;
			 case 'newpenalty':
			 case 'editpenaltytime':
			 case 'editpenalty':
				 processpenalty();
				 break;
			 case 'mainclockset':
				 mainmin = parseInt(inbuffer.substr(0,2),10);
				 mainsec = parseInt(inbuffer.substr(2,2),10);
				 maintenth = parseInt(inbuffer.substr(4,1),10);
				 display();
				 state = 'main';
				 setscreen("&nbsp;");
				 break;
			 case 'mainclockperiod':
				 if ((parseInt(mainmin,10) + parseInt(mainsec,10)) == 0 ) period++;
				 mainperiodmin = parseInt(inbuffer.substr(0,2),10);
				 mainperiodsec = parseInt(inbuffer.substr(2,2),10);
				 mainmin = mainperiodmin;
				 mainsec = mainperiodsec;
				 maintenth = 0;
				 display();
				 state = 'main';
				 setscreen("&nbsp;");
				 break;
			 case 'mainclockbreak':
				 mainbreakmin = parseInt(inbuffer.substr(0,2),10);
				 mainbreaksec = parseInt(inbuffer.substr(2,2),10);
				 mainmin = mainbreakmin;
				 mainsec = mainbreaksec;
				 maintenth = 0;
				 display();
				 state = 'main';
				 setscreen("&nbsp;");
				 break;
			 case 'mainclockot':
				 mainotmin = parseInt(inbuffer.substr(0,2),10);
				 mainotsec = parseInt(inbuffer.substr(2,2),10);
				 mainmin = mainotmin;
				 mainsec = mainotsec;
				 maintenth = 0;
				 display();
				 state = 'main';
				 setscreen("&nbsp;");
				 break;
			 case 'editfullto':
				 timeoutfullmin = parseInt(inbuffer.substr(0,2),10);
				 timeoutfullsec = parseInt(inbuffer.substr(2,2),10);
				 pressbutton('Time Out On/Off');
				 break;
			 case 'editpartto':
				 timeoutpartmin = parseInt(inbuffer.substr(0,2),10);
				 timeoutpartsec = parseInt(inbuffer.substr(2,2),10);
				 display();
				 state = 'main';
				 setscreen("&nbsp;");
				 break;
			 case 'scoreedit':
				 score = parseInt(inbuffer,10);
				 if (penaltyside == 'HOME') homescore = score; else awayscore = score;
				 display();
				 state = 'main';
				 setscreen("&nbsp;");
				 break;
			 case 'newgame':
				 resetboard();
				 setscreen("&nbsp;");
				 display();
				 state = 'main';
				 break;
		      case 'timeoutfull':
			 case 'timeoutpart':
				 state = 'timeoutrun';
				 if (!maintimerid) maintimerid = setInterval('clocktick()',1000)
				 break;
			 case 'main':
				 mode = "edit";
				 break;
		 }
      break;
    case 'Clear/Alt':
      switch (state)
	 {
		 case 'mainclockset':
			 state = 'mainclockperiod';
			 screentext = "MAIN CLOCK -EDIT<BR>PERIOD #1#2";
			 min = "" + mainperiodmin;
			 sec = "" + mainperiodsec;
			 if (min.length < 2) min = "0" + min;
			 if (sec.length < 2) sec = "0" + sec;
			 buffer = "" + min + sec;
			 inbuffer = "0000";
			 for(i = 0; i < 4; i++) numberpress(buffer.substr(i,1));
			 break;
		 case 'mainclockperiod':
			 state = 'mainclockbreak';
			 screentext = "MAIN CLOCK -EDIT<BR>BREAK #1#2";
			 min = "" + mainbreakmin;
			 sec = "" + mainbreaksec;
			 if (min.length < 2) min = "0" + min;
			 if (sec.length < 2) sec = "0" + sec;
			 buffer = "" + min + sec;
			 inbuffer = "0000";
			 for(i = 0; i < 4; i++) numberpress(buffer.substr(i,1));
			 break;
		 case 'mainclockbreak':
			 state = 'mainclockot';
			 screentext = "MAIN CLOCK -EDIT<BR>OT #1#2";
			 min = "" + mainotmin;
			 sec = "" + mainotsec;
			 if (min.length < 2) min = "0" + min;
			 if (sec.length < 2) sec = "0" + sec;
			 buffer = "" + min + sec;
			 inbuffer = "0000";
			 for(i = 0; i < 4; i++) numberpress(buffer.substr(i,1))
				 break;
		 case 'mainclockot':
			 state = 'main';
			 setscreen("&nbsp;");
			 break;
		 case 'timeoutrun':
			 state = 'main';
			 setscreen("&nbsp;");
			 if (maintimerid) {
				 clearInterval(maintimerid);
				 maintimerid = 0;
			 }
			 break;
		 case 'newpenalty':
		 case 'selectpenalty':
		 case 'editpenaltytime':
		 case 'editpenalty':
		 case 'sportcode':
		 case 'editfullto':
		 case 'editpartto':
		 case 'scoreedit':
			 if (lastbutton == 'Clear/Alt')
			 {
				 state = "main";
				 mode = "";
				 display();
				 setscreen("&nbsp;");
			 } else {
				 numberpress("0");
				 numberpress("0");
				 numberpress("0");
				 numberpress("0");
			 }
			 break;
		 case 'editmaindir':
		 case 'autohorn':
			 state = "main";
			 display();
			 setscreen("&nbsp;");
			 break;
		 case 'radio':
			 alert("Don't mess with the radio settings.");
			 break;
		 case 'resume':
			 state = 'sportcode';
			 screentext = "SELECT CODE<BR>CODE #1#2";
			 inbuffer="04";
			 setscreen("SELECT CODE<BR>CODE 04");
			 break;
		 case 'newgame':
			 setscreen("NEW CODE?<BR>ENTER TO ACCEPT");
			 state = 'editsportcode';
			 break;
		 case 'main':
			 mode = "alt";
			 break;
	 }
      break
    case "1":
     if (state == 'autohorn')
     {
      autohorn = true
      display()
      state = 'main'
      setscreen("&nbsp;")
     }
     if (state == 'editmaindir')
     {
      maindir = 'UP'
      display()
      state = 'main'
      setscreen("&nbsp;")
     }
    case "2":
     if (state == 'autohorn')
     {
      autohorn = false
      display()
      state = 'main'
      setscreen("&nbsp;")
     }
     if (state == 'editmaindir')
     {
      maindir = 'DOWN'
      display()
      state = 'main'
      setscreen("&nbsp;")
     }
    case '9/TOD/Game':
    case '8/Dim':
    case '7/New Game':
    case '6/1/10 Sec':
    case '5/Lamp Test':
    case '4/Segment':
    case "0":
    case "3":
      numberpress(btn)
      break 
   }
  }
 }
 lastbutton = btn
}

function numberpress(numpress)
{
      num = numpress.substr(0,1)
      switch(state)
      {
       case 'sportcode':
       case 'editperiod':
       case 'editpenalty':
       case 'scoreedit':
        inbuffer = inbuffer.substr(1) + num
        setscreen(screentext.replace("#1#2",inbuffer))
        break
       case 'editpenaltytime':
       case 'mainclockbreak':
       case 'mainclockot':
       case 'mainclockperiod':
       case 'editfullto':
       case 'editpartto':
        inbuffer = inbuffer.substr(1) + num
        setscreen(screentext.replace("#1#2",inbuffer.substr(0,2) + ":" + inbuffer.substr(2,2)))
        break
       case 'mainclockset':
        inbuffer = inbuffer.substr(1) + num
        setscreen(screentext.replace("#1#2",inbuffer.substr(0,2) + ":" + inbuffer.substr(2,2) + "." + inbuffer.substr(4)))
        break
      }
}

function clearnumber(tens, ones, color)
{
 if (!color) color = 'o';
 tens.src='images/blank.gif;
 ones.src='images/blank.gif;
}

function shownumber(num, tens, ones, color)
{
 if (num > 99) num = 99
 ten = parseInt(num / 10,10)
 one = num - (ten * 10)
 digit = "images/blank.gif
 if (ten > 0) digit = "images/" + ten + color + ".bmp"
 tens.src = digit
 ones.src = "images/" + one + color + ".bmp"
} 

function showfullnumber(num, tens, ones, color)
{
 if (num > 99) num = 99
 ten = parseInt(num / 10,10)
 one = num - (ten * 10)
 tens.src = "images/" + ten + color + ".bmp"
 ones.src = "images/" + one + color + ".bmp"
} 

function resetboard()
{
 mainmin = mainperiodmin
 mainsec = mainperiodsec
 homescore = 0
 awayscore = 0
 period = 1
 for(i = 0 ; i < 4 ; i++)
 {
  homepenalty[i][0] = false
  awaypenalty[i][0] = false
 }
}

function clearboard()
{
  boardnodes = document.getElementById('boarddiv').childNodes
  for(i = 0 ; i < boardnodes.length ; i++)
  { 
   if (boardnodes[i].id != 'board')
   {
    for(j = 0 ; j < boardnodes[i].childNodes.length ; j++)
    {
 	node = boardnodes[i].childNodes[j]
	if (node.id && node.src) node.src='images/blank.gif
    }
   }
  }
}

function display()
{
 img = document.images;
 shownumber(homescore, img['hmten'], img['hmone'], 'o');
 shownumber(awayscore, img['awten'], img['awone'], 'o');
// homepenalty.sort(comppenalty)
// topsort(homepenalty);
// awaypenalty.sort(comppenalty)
// topsort(awaypenalty);
 for(i=0;i<numpenalty;i++)
 { 
  if (homepenalty[i][0])
  {
   shownumber(homepenalty[i][1],img['h' + i + 'mten'],img['h' + i + 'mone'],'o')
   showfullnumber(homepenalty[i][2],img['h' + i + 'sten'],img['h' + i + 'sone'],'o')
   if (penaltyplayer) showfullnumber(homepenalty[i][3],img['hp' + i + 'ten'],img['hp' + i + 'one'],'o')
  } else {
   clearnumber(img['h' + i + 'mten'],img['h' + i + 'mone'])
   clearnumber(img['h' + i + 'sten'],img['h' + i + 'sone'])
   if (penaltyplayer) clearnumber(img['hp' + i + 'ten'],img['hp' + i + 'one'])
  } 
  if (awaypenalty[i][0])
  {
   shownumber(awaypenalty[i][1],img['a' + i + 'mten'],img['a' + i + 'mone'],'o')
   showfullnumber(awaypenalty[i][2],img['a' + i + 'sten'],img['a' + i + 'sone'],'o')
   if (penaltyplayer) showfullnumber(awaypenalty[i][3],img['ap' + i + 'ten'],img['ap' + i + 'one'],'o')
  } else {
   clearnumber(img['a' + i + 'mten'],img['a' + i + 'mone'])
   clearnumber(img['a' + i + 'sten'],img['a' + i + 'sone']) 
   if (penaltyplayer) clearnumber(img['ap' + i + 'ten'],img['ap' + i + 'one'])
  }
 }
 if (tenth)
 {
  shownumber(mainsec, img['clkmten'], img['clkmone'], 'g')
  showfullnumber(maintenth, img['clksone'], img['clksten'], 'g')
 } else {
  if (mainmin > 0) 
  {
   shownumber(mainmin, img['clkmten'], img['clkmone'], 'g')
  } else {
   clearnumber(img['clkmten'], img['clkmone'])
  }
  showfullnumber(mainsec, img['clksten'], img['clksone'],'g')
 }
 img['period'].src = 'images/' + period + 'y.bmp 
}

function test(i)
{
 if (i >= 0) {
  img1 = 'images/' + i + '/o.bmp
  img2 = 'images/' + i + 'y.bmp
  fn = "test(" + (i - 1) + ");"
  setTimeout(fn, 1000);
 } else {
   display()
   mainmin = 20

//  if (!maintimerid) maintimerid = setInterval('clocktick()',1000)
  return false;
 }
 document.images['hmten'].src=img1
 document.images['hmone'].src=img1
 document.images['awten'].src=img1
 document.images['awone'].src=img1
 document.images['clkmten'].src=img2
 document.images['clkmone'].src=img2
 document.images['clksten'].src=img2
 document.images['clksone'].src=img2
 document.images['h1mten'].src=img1
 document.images['h1mone'].src=img1
 document.images['h1sten'].src=img1
 document.images['h1sone'].src=img1
 document.images['h0mten'].src=img1
 document.images['h0mone'].src=img1
 document.images['h0sten'].src=img1
 document.images['h0sone'].src=img1
 document.images['a1mten'].src=img1
 document.images['a1mone'].src=img1
 document.images['a1sten'].src=img1
 document.images['a1sone'].src=img1
 document.images['a0mten'].src=img1
 document.images['a0mone'].src=img1
 document.images['a0sten'].src=img1
 document.images['a0sone'].src=img1
 document.images['period'].src=img2
 if (i == 0) document.getElementById("hornwav").play()
}

function lamptest()
{

  img1 = 'images/8o.bmp
  img2 = 'images/8y.bmp
  img3 = 'images/8g.bmp
  document.images['hmten'].src=img1
  document.images['hmone'].src=img1
  document.images['awten'].src=img1
  document.images['awone'].src=img1
  document.images['clkmten'].src=img3
  document.images['clkmone'].src=img3
  document.images['clksten'].src=img3
  document.images['clksone'].src=img3
  document.images['period'].src=img2
  for(i = 0; i < numpenalty; i++)
  {
   document.images['h' + i + 'mten'].src=img1
   document.images['h' + i + 'mone'].src=img1
   document.images['h' + i + 'sten'].src=img1
   document.images['h' + i + 'sone'].src=img1
   document.images['a' + i + 'mten'].src=img1
   document.images['a' + i + 'mone'].src=img1
   document.images['a' + i + 'sten'].src=img1
   document.images['a' + i + 'sone'].src=img1
   if (penaltyplayer)
   {
    document.images['hp' + i + 'ten'].src=img1
    document.images['hp' + i + 'one'].src=img1
    document.images['ap' + i + 'ten'].src=img1
    document.images['ap' + i + 'one'].src=img1
   }
  }
}
