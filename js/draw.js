$(document).ready(showHighRecord());

$("#startBtn").click(function() {
	console.log('222');
	startGame(this);
});

$("#restartBtn").click(function() {
	reStartGame();
});

$("#randomBtn").click(function() {
	randomP();
});

$("#triggerBtn").click(function() {
	trigger();
});

$("#adviceBtn").click(function() {
	advice();
});

// column number
var gameXSize = 16;
// row number
var gameYSize = 10;
// for init types of image
var imageKinds = 11;

// how many item left
var itemLeft = 0;

var mapArray = new Array();

var cxt;
var cellOneOn = false;
var baseMapSizeX = 1000;
var baseMapSizeY = 600;
var baseX = 100;
var baseY = 100;
var cellOnePos = {
	xPos : 0,
	yPos : 0,
	xIndex : 0,
	yIndex : 0
};
var cellTwoPos = {
	xPos : 0,
	yPos : 0,
	xIndex : 0,
	yIndex : 0
};
var isRemoveLineOn = false;
var removeLineOnTimeCounter = 0;
var mission = 1;
var missionRound = 5;

var cornerOneX = 0;
var cornerOneY = 0;

var cornerTwoX = 0;
var cornerTwoY = 0;

var TimeLimit = 60;
var TimeLeft = TimeLimit;
var TimePunish = 5;
var gameStart = false;
var isSuspend = false;

var score = 0;
var scoreAward = 10;

var randomCount = 2;

// handler for clear Interval
var drawMapInt = 0;
var oneSecCostInt = 0;

var audioRemoving;
var audioError;

function initMapAarry() {

	var c = document.getElementById("myCanvas");
	cxt = c.getContext("2d");

	for (var i = 0; i < gameXSize / 2; i++) {
		var one = new Array();
		var two = new Array();

		for (var m = 0; m < gameYSize; m++) {
			if (i == 0 || m == 0 || m == gameYSize - 1) {
				one[m] = 0;
				two[m] = 0;
			} else {

				var temp = Math.floor(Math.random() * imageKinds) + 1;
				one[m] = temp;
				two[m] = temp;
			}

		}
		mapArray[i] = one;
		mapArray[gameXSize - i - 1] = two;
	}

	var total = '';
	for (x in mapArray) {
		for (y in mapArray[x]) {
			total += '' + mapArray[x][y];
		}
		total += '\n';
	}
	mapRandom();
}

function mapRandom() {
	var transPointX = 0;
	var transPointY = 0;
	gameStart = false;
	for (x in mapArray) {
		for (y in mapArray[x]) {
			var tempX = Math.floor(Math.random() * (gameXSize - 2) + 1);
			var tempY = Math.floor(Math.random() * (gameYSize - 2) + 1);
			if (mapArray[x][y] != 0) {
				if (mapArray[tempX][tempY] != 0) {
					var temp = mapArray[x][y];
					mapArray[x][y] = mapArray[tempX][tempY];
					mapArray[tempX][tempY] = temp;
					transPointX = 0;
					transPointY = 0;
				} else if (transPointX != 0 && transPointY != 0) {
					var temp = mapArray[x][y];
					mapArray[x][y] = mapArray[transPointX][transPointY];
					mapArray[transPointX][transPointY] = temp;
					transPointX = 0;
					transPointY = 0;
				} else {
					transPointX = x;
					transPointY = y;
				}
			}

		}

	}
	gameStart = true;
}

function randomP() {
	if (!gameStart || isSuspend) {
		return;
	}
	if (randomCount <= 0) {
		return;
	}
	randomCount--;
	mapRandom();
}

function preImage(url, id, callback) {
	var img = new Image();
	//创建一个Image对象，实现图片的预下载
	img.src = url;
	img.id = id;
	if (img.complete) {// 如果图片已经存在于浏览器缓存，直接调用回调函数
		callback.call(img);
		return;
		// 直接返回，不用再处理onload事件
	}

	img.onload = function() {//图片下载完毕时异步调用callback函数。
		callback.call(img);
		//将回调函数的this替换为Image对象
	};
}

function drawMap() {
	cxt.clearRect(0, 0, baseMapSizeX, baseMapSizeY);
	// var testimg=document.getElementById("tulip");
	// cxt.drawImage(testimg,100,10);
	var x_position;
	var y_position;
	for (x in mapArray) {
		x_position = x * 49 + baseX;
		for (y in mapArray[x]) {
			y_position = y * 49 + baseY;
			if (mapArray[x][y] != 0) {
				var drawingImg = document.getElementById("image" + mapArray[x][y]);
				cxt.drawImage(drawingImg, x_position, y_position);

				// var img=new Image();
				// img.src="images1/"+mapArray[x][y]+".png";
				// img.id=x+''+y;
				// cxt.drawImage(img,x_position,y_position);
			}
		}
	}
	if (cellOneOn) {
		cxt.lineWidth = 4;
		cxt.strokeStyle = "rgba(255,255, 0, 0.6)";
		cxt.strokeRect(cellOnePos.xPos, cellOnePos.yPos, 49, 49)
	}
	if (isRemoveLineOn) {
		cxt.lineWidth = 4;
		cxt.strokeStyle = "rgba(255,100, 0, 0.6)";
		cxt.strokeRect(cellTwoPos.xPos, cellTwoPos.yPos, 49, 49)

		cxt.lineWidth = 3;
		cxt.strokeStyle = "rgb(255,0, 0)";
		cxt.lineJoin = 'round';
		cxt.beginPath();
		cxt.moveTo(cellOnePos.xPos + 24, cellOnePos.yPos + 24);

		if (cornerOneX != 0 && cornerOneY != 0) {
			cxt.lineTo(cornerOneX, cornerOneY)
		}

		if (cornerTwoX != 0 && cornerTwoY != 0) {
			cxt.lineTo(cornerTwoX, cornerTwoY)
		}

		cxt.lineTo(cellTwoPos.xPos + 24, cellTwoPos.yPos + 24)
		cxt.stroke();
		removeLineOnTimeCounter += 1;
		if (removeLineOnTimeCounter >= 3) {
			removeLineOnTimeCounter = 0;
			isRemoveLineOn = false;
			cellOneOn = false;
			mapArray[cellOnePos.xIndex][cellOnePos.yIndex] = 0;
			mapArray[cellTwoPos.xIndex][cellTwoPos.yIndex] = 0;
			mapMoving(cellOnePos, cellTwoPos);
			cornerOneX = 0;
			cornerOneY = 0;
			cornerTwoX = 0;
			cornerYwoY = 0;
			if (itemLeft <= 0) {
				disableEvent();
				drawMap();
			}
		}
	}

	// time process
	var timeFrameX = 150;
	var timeFrameY = 70;
	var timeFrameLength = 500;
	var timeFrameHeight = 10;

	cxt.lineWidth = 6;
	cxt.strokeStyle = "rgba(0,0,255, 0.6)";
	cxt.strokeRect(timeFrameX, timeFrameY, timeFrameLength, timeFrameHeight);
	cxt.fillStyle = "rgba(255,128,64,0.6)";
	cxt.fillRect(timeFrameX, timeFrameY, timeFrameLength * (TimeLeft / TimeLimit), timeFrameHeight);

	cxt.shadowOffsetX = 2;
	cxt.shadowOffsetY = 2;
	cxt.shadowBlur = 2;
	cxt.shadowColor = "rgba(0, 0, 0, 0.5)";

	cxt.font = "24px Times New Roman";
	cxt.fillStyle = "Black";
	cxt.fillText(TimeLeft, timeFrameX + timeFrameLength + 30, timeFrameY + 12);

	var textH = 50;
	var textW = timeFrameX;
	// socre
	cxt.font = "32px Times New Roman";
	cxt.fillStyle = "yellow";
	cxt.fillText('Score : ' + score, textW, textH);

	// random count
	cxt.fillText('Shuffle : ' + randomCount, textW + 250, textH);

	// mission
	cxt.font = "32px Times New Roman";
	cxt.fillStyle = "red";
	cxt.fillText('Level : ' + mission, baseMapSizeX - 270, textH);

}

function initEvent() {

	if (drawMapInt != 0 || oneSecCostInt != 0) {
		disableEvent();
	}

	document.addEventListener('mousedown', clickProcess, false);
	drawMapInt = setInterval(drawMap, 1000 / 50);
	oneSecCostInt = setInterval(oneSecCost, 1000);
}

function trigger() {
	if (!gameStart) {
		return;
	}
	if (!isSuspend) {
		suspend();
	} else {
		resume();
	}
	var buttonIcon = isSuspend ? '5' : '4';
	var buttonSuspend = document.getElementById("suspend");
	buttonSuspend.setAttribute("data-icon", buttonIcon)
	isSuspend = !isSuspend;
}

function resume() {

	if (TimeLeft <= 0) {
		return;
	}
	if (gameStart) {
		initEvent();
	}
}

function disableEvent() {

	clearInterval(drawMapInt);
	clearInterval(oneSecCostInt);
	document.removeEventListener('mousedown', clickProcess, false);
}

function suspend() {
	if (gameStart) {
		cxt.clearRect(baseX, baseY, baseMapSizeX - baseX, baseMapSizeY - baseY);
		cxt.font = "64px Times New Roman";
		cxt.fillStyle = "red";
		cxt.fillText("Pause~~", baseMapSizeX / 2 - 100, baseMapSizeY / 2);
		disableEvent();
	}
}

function clickProcess(e) {
	if (!gameStart || isRemoveLineOn == true) {
		return;
	}
	if (e.clientX < baseX + 60 || e.clientY < baseY + 60) {
		return;
	}
	var index_x = parseInt((e.clientX - baseX - 60) / 49, 10) + 1;
	var index_y = parseInt((e.clientY - baseY - 60) / 49, 10) + 1;
	if (index_x >= gameXSize - 1) {
		cellOneOn = false;
		return;
	}
	if (index_y >= gameYSize - 1) {
		cellOneOn = false;
		return;
	}
	if (mapArray[index_x][index_y] == 0) {
		cellOneOn = false;
		return;
	} else {
		drawCell(index_x, index_y);
	}

}

function drawCell(row, column) {

	if (cellOneOn) {
		if (row == cellOnePos.xIndex && column == cellOnePos.yIndex) {
			cellOneOn = false;
			return;
		}
		cellTwoPos.xPos = row * 49 + baseX;
		cellTwoPos.yPos = column * 49 + baseY;
		cellTwoPos.xIndex = row;
		cellTwoPos.yIndex = column;
		if (deal()) {

			if (mapArray[cellOnePos.xIndex][cellOnePos.yIndex] != mapArray[cellTwoPos.xIndex][cellTwoPos.yIndex]) {
				audioError.load();
				audioError.play();
				if (TimeLeft <= TimePunish) {
					TimeLeft = 0;
				} else {
					TimeLeft -= TimePunish;
				}

				cellOneOn = false;
			} else {
				audioRemoving.load();
				audioRemoving.play();
				isRemoveLineOn = true;
				score += scoreAward;
				itemLeft -= 2;
				if (TimeLeft < TimeLimit) {
					TimeLeft += 1;
				}
				if (itemLeft <= 0) {
					if (TimeLeft > 0) {
						score += TimeLeft * 20
					}
					nextMission();
				}
				var tempHigh = Number(localStorage.highRecord);
				if (score > tempHigh) {
					localStorage.highRecord = score;
					showHighRecord();
				}
			}

		} else {
			cellOneOn = false;
			drawCell(row, column);
		}
	} else {
		cellOneOn = true;
		cellOnePos.xPos = row * 49 + baseX;
		cellOnePos.yPos = column * 49 + baseY;
		cellOnePos.xIndex = row;
		cellOnePos.yIndex = column;
	}

}

function deal() {
	var return_value = false;

	if (cellTwoPos.xIndex == cellOnePos.xIndex || cellTwoPos.yIndex == cellOnePos.yIndex) {
		if (cellTwoPos.xIndex == cellOnePos.xIndex) {
			return_value = sameColumnDeal(cellOnePos.xIndex, cellOnePos.yIndex, cellTwoPos.yIndex);
		} else {
			return_value = sameRowDeal(cellOnePos.xIndex, cellTwoPos.xIndex, cellOnePos.yIndex);
		}
	} else {
		return_value = diffLineDeal(cellOnePos.xIndex, cellTwoPos.xIndex, cellOnePos.yIndex, cellTwoPos.yIndex);
	}
	return return_value;
}

function sameColumnDeal(x, y1, y2) {

	if (isBlockedSameColumn(x, y1, y2)) {
		cornerOneX = 0;
		cornerOneY = 0;
		cornerTwoX = 0;
		cornerTwoY = 0;
		return true;
	} else {
		for (var i = x + 1; i < gameXSize; i++) {
			if (mapArray[i][y1] == 0 && mapArray[i][y2] == 0) {
				if (isBlockedSameColumn(i, y1, y2)) {
					cornerOneX = i * 49 + baseX + 24;
					cornerOneY = y1 * 49 + baseY + 24;
					cornerTwoX = i * 49 + baseX + 24;
					cornerTwoY = y2 * 49 + baseY + 24;
					return true;
				} else {
					continue;
				}
			} else {
				break;
			}
		}
		for (var m = x - 1; m >= 0; m--) {
			if (mapArray[m][y1] == 0 && mapArray[m][y2] == 0) {
				if (isBlockedSameColumn(m, y1, y2)) {
					cornerOneX = m * 49 + baseX + 24;
					cornerOneY = y1 * 49 + baseY + 24;
					cornerTwoX = m * 49 + baseX + 24;
					cornerTwoY = y2 * 49 + baseY + 24;
					return true;
				} else {
					continue;
				}
			} else {
				break;
			}
		}

		return false;
	}
}

function isBlockedSameColumn(x, y1, y2) {

	if (y1 == y2 + 1 || y2 == y1 + 1) {
		return true;
	}

	if (y1 > y2) {
		for (var i = y1 - 1; i > y2; i--) {
			if (mapArray[x][i] == 0) {
			} else {
				return false;
			}
		}
		return true;
	} else {
		for (var i = y1 + 1; i < y2; i++) {
			if (mapArray[x][i] == 0) {
			} else {
				return false;
			}
		}
		return true;
	}
}

function sameRowDeal(x1, x2, y) {
	if (isBlockedSameRow(x1, x2, y)) {

		cornerOneX = 0;
		cornerOneY = 0;
		cornerTwoX = 0;
		cornerTwoY = 0;
		return true;
	} else {
		for (var i = y + 1; i < gameYSize; i++) {
			if (mapArray[x1][i] == 0 && mapArray[x2][i] == 0) {
				if (isBlockedSameRow(x1, x2, i)) {
					cornerOneX = x1 * 49 + baseX + 24;
					cornerOneY = i * 49 + baseY + 24;
					cornerTwoX = x2 * 49 + baseX + 24;
					cornerTwoY = i * 49 + baseY + 24;
					return true;
				} else {
					continue;
				}
			} else {
				break;
			}
		}
		for (var m = y - 1; m >= 0; m--) {
			if (mapArray[x1][m] == 0 && mapArray[x2][m] == 0) {
				if (isBlockedSameRow(x1, x2, m)) {
					cornerOneX = x1 * 49 + baseX + 24;
					cornerOneY = m * 49 + baseY + 24;
					cornerTwoX = x2 * 49 + baseX + 24;
					cornerTwoY = m * 49 + baseY + 24;
					return true;
				} else {
					continue;
				}
			} else {
				break;
			}
		}

		return false;
	}
}

function isBlockedSameRow(x1, x2, y) {

	if (x1 == x2 + 1 || x2 == x1 + 1) {
		return true;
	}

	if (x1 > x2) {
		for (var i = x1 - 1; i > x2; i--) {
			if (mapArray[i][y] == 0) {
			} else {
				return false;
			}
		}
		return true;
	} else {
		for (var i = x1 + 1; i < x2; i++) {
			if (mapArray[i][y] == 0) {
			} else {
				return false;
			}
		}
		return true;
	}
}

function diffLineDeal(x1, x2, y1, y2) {

	if (mapArray[x1][y2] == 0 || mapArray[x2][y1] == 0) {
		//maybe one corner
		if (mapArray[x2][y1] == 0 && isBlockedSameRow(x1, x2, y1) && isBlockedSameColumn(x2, y1, y2)) {
			cornerOneX = x2 * 49 + baseX + 24;
			cornerOneY = y1 * 49 + baseY + 24;
			cornerTwoX = 0;
			cornerTwoY = 0;
			return true;
		}
		if (mapArray[x1][y2] == 0 && isBlockedSameColumn(x1, y1, y2) && isBlockedSameRow(x1, x2, y2)) {
			cornerOneX = x1 * 49 + baseX + 24;
			cornerOneY = y2 * 49 + baseY + 24;
			cornerTwoX = 0;
			cornerTwoY = 0;
			return true;
		}
	}

	for (var i = x1 + 1; i < gameXSize; i++) {
		if (mapArray[i][y1] == 0) {
			if (isBlockedSameColumn(i, y1, y2) && mapArray[i][y2] == 0) {
				if (isBlockedSameRow(i, x2, y2)) {
					// need some path cache here
					cornerOneX = i * 49 + baseX + 24;
					cornerOneY = y1 * 49 + baseY + 24;
					cornerTwoX = i * 49 + baseX + 24;
					cornerTwoY = y2 * 49 + baseY + 24;
					return true;
				}
			}
		} else {
			break;
		}
	}

	for (var i = x1 - 1; i >= 0; i--) {
		if (mapArray[i][y1] == 0) {
			if (isBlockedSameColumn(i, y1, y2) && mapArray[i][y2] == 0) {
				if (isBlockedSameRow(i, x2, y2)) {
					// need some path cache here
					cornerOneX = i * 49 + baseX + 24;
					cornerOneY = y1 * 49 + baseY + 24;
					cornerTwoX = i * 49 + baseX + 24;
					cornerTwoY = y2 * 49 + baseY + 24;
					return true;
				}
			}
		} else {
			break;
		}
	}

	for (var i = y1 + 1; i < gameYSize; i++) {
		if (mapArray[x1][i] == 0) {
			if (isBlockedSameRow(x1, x2, i) && mapArray[x2][i] == 0) {
				if (isBlockedSameColumn(x2, y2, i)) {
					// need some path cache here
					cornerOneX = x1 * 49 + baseX + 24;
					cornerOneY = i * 49 + baseY + 24;
					cornerTwoX = x2 * 49 + baseX + 24;
					cornerTwoY = i * 49 + baseY + 24;
					return true;
				}
			}
		} else {
			break;
		}
	}

	for (var i = y1 - 1; i >= 0; i--) {
		if (mapArray[x1][i] == 0) {
			if (isBlockedSameRow(x1, x2, i) && mapArray[x2][i] == 0) {
				if (isBlockedSameColumn(x2, y2, i)) {
					// need some path cache here
					cornerOneX = x1 * 49 + baseX + 24;
					cornerOneY = i * 49 + baseY + 24;
					cornerTwoX = x2 * 49 + baseX + 24;
					cornerTwoY = i * 49 + baseY + 24;
					return true;
				}
			}
		} else {
			break;
		}
	}

	return false;
}

function oneSecCost() {
	timeCost(1);
}

function timeCost(second) {
	TimeLeft -= second;
	if (TimeLeft < 0) {
		TimeLeft = 0;
		gameStart = false;
		disableEvent();
		cellOneOn = false;

		alert('Game Over!');
	}
}

function startGame(startButton) {
	startButton.style.display = "none";
	$("#restartBtn").css('display', 'inline');
	$("#randomBtn").css('display', 'inline');
	$("#triggerBtn").css('display', 'inline');
	$("#adviceBtn").css('display', 'inline');
	reStartGame();
}

function reStartGame() {
	cellOnePos = {
		xPos : 0,
		yPos : 0,
		xIndex : 0,
		yIndex : 0
	};
	cellTwoPos = {
		xPos : 0,
		yPos : 0,
		xIndex : 0,
		yIndex : 0
	};
	cellOneOn = false;
	TimeLeft = TimeLimit;
	score = 0;
	scoreAward = 10;
	randomCount = 2;
	mission = 2;
	imageKinds = 9;
	itemLeft = (gameXSize - 2) * (gameYSize - 2);
	initMapAarry();
	initEvent();
	initAudio();
	gameStart = true;

}

function initAudio() {
	audioRemoving = document.createElement('audio');
	audioRemoving.src = "audio/click.ogg";

	audioError = document.createElement('audio');
	audioError.src = "audio/newe.wav";
}

function nextMission() {
	if (imageKinds >= 30) {
		alert('you are done!~\n start over');
		reStartGame();
		return;
	}
	cellOneOn = false;
	isRemoveLineOn = false;
	mission++;
	imageKinds++;
	TimeLeft = TimeLimit;
	scoreAward += 5;
	randomCount += 2;
	itemLeft = (gameXSize - 2) * (gameYSize - 2);
	cellOnePos = {
		xPos : 0,
		yPos : 0,
		xIndex : 0,
		yIndex : 0
	};
	cellTwoPos = {
		xPos : 0,
		yPos : 0,
		xIndex : 0,
		yIndex : 0
	};
	cornerOneX = 0;
	cornerOneY = 0;
	cornerTwoX = 0;
	cornerTwoY = 0;
	initMapAarry();
}

function loadWeibo() {

	var _w = 32, _h = 32;
	var param = {
		url : location.href,
		type : '1',
		count : '', /**是否显示分享数，1显示(可选)*/
		appkey : '212575121', /**您申请的应用appkey,显示分享来源(可选)*/
		title : '不错的离线连连看 :) http://t.cn/8FTPQyk http://www.jian-yin.com/linking/ #连连看#', /**分享的文字内容(可选，默认为所在页面的title)*/
		pic : '', /**分享图片的路径(可选)*/
		ralateUid : '零毁', /**关联用户的UID，分享微博会@该用户(可选)*/
		rnd : new Date().valueOf()
	}
	var temp = [];
	for (var p in param ) {
		temp.push(p + '=' + encodeURIComponent(param[p] || ''))
	}

	$('#weibo').html('<iframe allowTransparency="true" style="position: absolute;left: 950px;top : 560px;" frameborder="0" scrolling="no" src="http://hits.sinajs.cn/A1/weiboshare.html?' + temp.join('&') + '" width="' + _w + '" height="' + _h + '"></iframe>');
}

function showHighRecord() {
	var score = 0;
	if (localStorage.highRecord) {
		score = localStorage.highRecord;
	} else {
		score = 0;
		localStorage.highRecord = 0;
	}
	// var best = document.getElementById("best");
	// $("#best")[0].innerHTML = "" + score;
	$("#best").html("" + score);
	// best.innerHTML = "" + score;
	loadWeibo();
}

function coming() {
	alert('Coming Later');
}

function mapMoving(cellOnePos_in, cellTwoPos_in) {
	var direct = (mission - 1) % missionRound;
	switch(direct) {
		case 1:
			if (cellOnePos_in.yIndex > cellTwoPos_in.yIndex) {
				directDOWN(cellTwoPos_in);
				directDOWN(cellOnePos_in);
			} else {
				directDOWN(cellOnePos_in);
				directDOWN(cellTwoPos_in);
			}
			break
		case 2:
			if (cellOnePos_in.yIndex > cellTwoPos_in.yIndex) {
				directUP(cellOnePos_in);
				directUP(cellTwoPos_in);
			} else {
				directUP(cellTwoPos_in);
				directUP(cellOnePos_in);
			}
			break
		case 3:
			if (cellOnePos_in.xIndex > cellTwoPos_in.xIndex) {
				directRIGHT(cellTwoPos_in);
				directRIGHT(cellOnePos_in);
			} else {
				directRIGHT(cellOnePos_in);
				directRIGHT(cellTwoPos_in);
			}
			break
		case 4:
			if (cellOnePos_in.xIndex > cellTwoPos_in.xIndex) {
				directLEFT(cellOnePos_in);
				directLEFT(cellTwoPos_in);
			} else {
				directLEFT(cellTwoPos_in);
				directLEFT(cellOnePos_in);
			}
			break
		default:
	}
}

function directDOWN(cell) {

	if (cell.yIndex <= 1) {
		return;
	}
	if (cell.yIndex == 2 && mapArray[cell.xIndex][1] == 0) {
		return;
	}
	if (mapArray[cell.xIndex][cell.yIndex - 1] == 0 && mapArray[cell.xIndex][cell.yIndex - 2] == 0) {
		return;
	}
	for (var i = cell.yIndex - 1; i >= 0; i--) {
		mapArray[cell.xIndex][i + 1] = mapArray[cell.xIndex][i];
		if (mapArray[cell.xIndex][i] == 0 && i != cell.yIndex - 1) {
			break;
		}
	}
}

function directUP(cell) {
	if (cell.yIndex >= gameYSize - 2) {
		return;
	}
	if (cell.yIndex == gameYSize - 3 && mapArray[cell.xIndex][gameYSize - 2] == 0) {
		return;
	}
	if (mapArray[cell.xIndex][cell.yIndex + 1] == 0 && mapArray[cell.xIndex][cell.yIndex + 2] == 0) {
		return;
	}
	for (var i = cell.yIndex + 1; i < gameYSize; i++) {
		mapArray[cell.xIndex][i - 1] = mapArray[cell.xIndex][i];
		if (mapArray[cell.xIndex][i] == 0 && i != cell.yIndex + 1) {
			break;
		}
	}
}

function directRIGHT(cell) {
	if (cell.xIndex <= 1) {
		return;
	}
	if (cell.xIndex == 2 && mapArray[1][cell.yIndex] == 0) {
		return;
	}
	if (mapArray[cell.xIndex - 1][cell.yIndex] == 0 && mapArray[cell.xIndex - 2][cell.yIndex] == 0) {
		return;
	}
	for (var i = cell.xIndex - 1; i >= 0; i--) {
		mapArray[i + 1][cell.yIndex] = mapArray[i][cell.yIndex];
		if (mapArray[i][cell.yIndex] == 0 && i != cell.xIndex - 1) {
			break;
		}
	}
}

function directLEFT(cell) {
	if (cell.xIndex >= gameXSize - 2) {
		return;
	}
	if (cell.xIndex == gameXSize - 3 && mapArray[gameXSize - 2][cell.yIndex] == 0) {
		return;
	}
	if (mapArray[cell.xIndex + 1][cell.yIndex] == 0 && mapArray[cell.xIndex + 2][cell.yIndex] == 0) {
		return;
	}
	for (var i = cell.xIndex + 1; i < gameXSize; i++) {
		mapArray[i - 1][cell.yIndex] = mapArray[i][cell.yIndex];
		if (mapArray[i][cell.yIndex] == 0 && i != cell.xIndex + 1) {
			break;
		}
	}
}

function advice() {
	window.open("./advice.html", "_blank", "toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=400, height=380, left=500, top=300")
}