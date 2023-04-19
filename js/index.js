const mapNames = Object.freeze({
	KURKEN: 0,
	MAINLAND: 1,
	CLERIA: 2,
	NEMED: 3,
	ORIM: 4,
	CODE: 5
});

const container = document.querySelector('.container');
const image = document.querySelector('.image');
const img = document.getElementById('currentMap');
const button = document.querySelector('button');
const itemMarker = document.querySelector('.itemMarkers');
const numberFoundLabel = document.getElementById('numberFoundLabel');

const speed = 0.15;
let areaStartIndex = [0, -1, -1, -1, -1, -1, -1];
let areaNames = ["Kurken", "Mainland", "Cleria", "Nemed", "Orim", "Code"];
let currentIndex = 1;
for (let i = 0; i < itemLookupTable.length; i++)
{
	if (itemLookupTable[i][0].localeCompare(areaNames[currentIndex]) == 0)
	{
		areaStartIndex[currentIndex] = i;
		currentIndex++;
	}
}
areaStartIndex[currentIndex] = itemLookupTable.length;

let areaStartIndexMonster = [0, -1, -1, -1, -1, -1, -1];
currentIndex = 1;
for (let i = 0; i < monsterDropLookupTable.length; i++)
{
	if (monsterDropLookupTable[i][0].localeCompare(areaNames[currentIndex]) == 0)
	{
		areaStartIndexMonster[currentIndex] = i;
		currentIndex++;
	}
}
areaStartIndexMonster[currentIndex] = monsterDropLookupTable.length;

let isDragging = false;
let isSetup = false;
let isOverImage = false;
let size = { 
  w: image.offsetWidth, 
  h: image.offsetHeight 
};
let pos = { x: 0, y: 0 };
let target = { x: 0, y: 0 };
let pointer = { x: 0, y: 0 };
let overflow = { x: 0, y: 0 };
let scale = 1;
let prevPointerPosition = { x: 0, y: 0 };
let prevPointerDist = 1;
let iconScaleFactor = 1;
let imageScaleFactor = 1;
let minScale = 1;
let maxScale = 8;

let imgArr = [];
let imgPos = [];

function queryItems()
{
	var curDot = itemMarker.lastElementChild;
	while (curDot)
	{
		itemMarker.removeChild(curDot);
		curDot = itemMarker.lastElementChild;
	}
	imgArr = [];
	imgPos = [];
	var term = $("#items").val().toLowerCase();
	if (!term)
	{
		return 0;
	}
	var selectMenu = document.getElementById("maps");
	var selectedMapName = selectMenu.options[selectMenu.selectedIndex].text;
	var selectedMapIndex = -1;
	switch (selectedMapName)
	{
		case "Kurken":
			selectedMapIndex = mapNames.KURKEN;
			break;
		case "Mainland":
			selectedMapIndex = mapNames.MAINLAND;
			break;
		case "Cleria":
			selectedMapIndex = mapNames.CLERIA;
			break;
		case "Nemed":
			selectedMapIndex = mapNames.NEMED;
			break;
		case "Orim":
			selectedMapIndex = mapNames.ORIM;
			break;
		case "Code":
			selectedMapIndex = mapNames.CODE;
			break;
	}
	var gatheringToolMaxRank = [parseInt($("#handRankDropdown").val()), parseInt($("#rodRankDropdown").val()), parseInt($("#sickleRankDropdown").val()),
								parseInt($("#axeRankDropdown").val()), parseInt($("#hammerRankDropdown").val()), parseInt($("#netRankDropdown").val())];
	let numberFound = 0;
	
	function addImageToMap(imagePath, coordX, coordY)
	{
		let pixelXShift = 0;
		let pixelYShift = 0;
		switch (selectedMapIndex)
		{
			case mapNames.KURKEN:
				pixelXShift = -20;
				pixelYShift = -20;
				break;
			case mapNames.MAINLAND:
				pixelXShift = -20;
				pixelYShift = -1560;
				break;
			case mapNames.CLERIA:
				pixelXShift = -20;
				pixelYShift = -20;
				break;
			case mapNames.NEMED:
				pixelXShift = -1460;
				pixelYShift = -20;
				break;
			case mapNames.ORIM:
				pixelXShift = -180;
				pixelYShift = -500;
				break;
			case mapNames.CODE:
				pixelXShift = -20;
				pixelYShift = 500;
				break;
		}
		let pixelXScale = 1.6;
		let pixelYScale = 1.6;
		let pixelX = coordX * pixelXScale + pixelXShift;
		let pixelY = coordY * pixelYScale + pixelYShift;
		var addImageBox = document.createElement("div");
		addImageBox.className = "imageBox";
		var addDot = document.createElement("div")
		addDot.className = "dot";
		var addImage = document.createElement("img");
		addImage.src = imagePath;
		addDot.append(addImage);
		addImageBox.append(addDot);
		itemMarker.append(addImageBox);
		imgArr.push(addDot);
		imgPos.push({ x: pixelX, y: pixelY });
		numberFound++;
	}

	for (let i = areaStartIndex[selectedMapIndex]; i < areaStartIndex[selectedMapIndex + 1]; i++)
	{
		var flag = false;
		for (let j = 0; !flag && j < gatheringToolMaxRank.length; j++)
		{
			for (let k = 0; k < 3; k++)
			{
				if (gatheringToolMaxRank[j] <= k) break;
				// Base game lookup
				if (itemLookupTable[i][j * 6 + k * 2 + 5])
				{
					if (itemLookupTable[i][j * 6 + k * 2 + 5].toLowerCase().localeCompare(term) == 0)
					{
						flag = true;
						break;
					}
				}
				// DLC lookup
				if (parseInt(itemLookupTable[i][4]) != 0 && itemLookupTable[i][j * 6 + k * 2 + 5 + 36])
				{
					if (parseInt(itemLookupTable[i][4]) == 1 && !$("#ArtOfAdventureCheckbox")[0].checked) continue;
					if (parseInt(itemLookupTable[i][4]) == 2 && !$("#AlchemyMysteriesCheckbox")[0].checked) continue;
					if (itemLookupTable[i][j * 6 + k * 2 + 5 + 36].toLowerCase().localeCompare(term) == 0)
					{
						flag = true;
						break;
					}
				}
			}
		}
		if (flag)
		{
			addImageToMap("img/GatheringHand.png", parseInt(itemLookupTable[i][1]), parseInt(itemLookupTable[i][3]));
		}
	}

	for (let i = areaStartIndexMonster[selectedMapIndex]; i < areaStartIndexMonster[selectedMapIndex + 1]; i++)
	{
		var flag = false;
		for (let j = 0; !flag && j < 4; j++)
		{
			if (!monsterDropLookupTable[i][j + 5]) continue;
			if (monsterDropLookupTable[i][j + 5].toLowerCase().localeCompare(term) == 0)
			{
				flag = true;
				break;
			}
		}
		if (flag)
		{
			addImageToMap("img/Monster/Monster" + monsterDropLookupTable[i][4] + ".png", parseInt(monsterDropLookupTable[i][1]), parseInt(monsterDropLookupTable[i][3]));
		}
	}
	return numberFound;
}

img.onload = function() {
	var numberFound = queryItems();
	numberFoundLabel.innerHTML = "Number found: " + numberFound;
	setup();
}
if (img.complete)
{
	setup();
}

button.onclick = function() {
	isSetup = false;
	var selectMenu = document.getElementById("maps");
	var selectedMap = selectMenu.options[selectMenu.selectedIndex].text;
	img.src = "img/" + selectedMap + ".jpg";
}

function setup()
{
	imageScaleFactor = img.width / img.naturalWidth;
	iconScaleFactor = imageScaleFactor / 4;
	minScale = Math.max(1, (img.naturalWidth / container.clientWidth) / (img.naturalHeight / container.clientHeight));
	maxScale = 8 * minScale;
	scale = minScale;
	pos = { x: 0, y: 0 };
	target = { x: 0, y: 0 };
	pointer = { x: 0, y: 0 };
	size.w = image.offsetWidth;
	size.h = image.offsetHeight;
	overflow.x = img.offsetWidth - image.offsetWidth;
	overflow.y = img.offsetHeight - image.offsetHeight;
	image.style.transform = `translate(${pos.x}px,${pos.y}px) scale(${scale},${scale})`;
	for (var i = 0; i < imgArr.length; i++)
	{
		imgArr[i].style.transform = `translate(${imgPos[i].x * imageScaleFactor * scale + pos.x}px,${imgPos[i].y * imageScaleFactor * scale + pos.y}px) scale(${scale * iconScaleFactor},${scale * iconScaleFactor})`;
	}
	isSetup = true;
}

window.addEventListener('resize', event => {
	setup();
})

function recalculateAveragePos()
{
	var averagePos = { x: 0, y: 0 };
	for (let i = 0; i < event.touches.length; i++)
	{
		averagePos.x += event.touches[i].clientX;
		averagePos.y += event.touches[i].clientY;
	}
	averagePos.x /= event.touches.length;
	averagePos.y /= event.touches.length;
	prevPointerPosition.x = averagePos.x;
	prevPointerPosition.y = averagePos.y;
}

img.addEventListener('touchstart', event => {
	event.preventDefault();
	if (event.touches.length == 2)
	{
		prevPointerDist = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
	}
	isDragging = true;
	recalculateAveragePos();
})

img.addEventListener('touchend', event => {
	event.preventDefault();
	if (event.touches.length == 0)
	{
		isDragging = false;
	}
	recalculateAveragePos();
})

img.addEventListener('touchcancel', event => {
	event.preventDefault();
	if (event.touches.length == 0)
	{
		isDragging = false;
	}
	recalculateAveragePos();
})

img.addEventListener('touchmove', event => {
	event.preventDefault();
	if (isDragging)
	{
		var averagePos = { x: 0, y: 0 };
		for (let i = 0; i < event.touches.length; i++)
		{
			averagePos.x += event.touches[i].clientX;
			averagePos.y += event.touches[i].clientY;
		}
		averagePos.x /= event.touches.length;
		averagePos.y /= event.touches.length;
		if (event.touches.length == 2)
		{
			var curDist = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
			pointer.x = averagePos.x - container.offsetLeft;
			pointer.y = averagePos.y - container.offsetTop;
			target.x = (pointer.x - pos.x) / scale;
			target.y = (pointer.y - pos.y) / scale;
			
			scale *= (curDist - prevPointerDist) * speed * .05 + 1;
			
			scale = Math.max(minScale, Math.min(maxScale, scale));

			pos.x = -target.x * scale + pointer.x;
			pos.y = -target.y * scale + pointer.y;
			prevPointerDist = curDist;
		}
		pos.x += averagePos.x - prevPointerPosition.x;
		pos.y += averagePos.y - prevPointerPosition.y;
		if (pos.x > 0)
		{
			pos.x = 0;
		}
		if (pos.y > 0)
		{
			pos.y = 0;
		}
		if (size.w - pos.x > (size.w + overflow.x) * scale)
		{
			pos.x = size.w - (size.w + overflow.x) * scale;
		}
		if (size.h - pos.y > (size.h + overflow.y) * scale)
		{
			pos.y = size.h - (size.h + overflow.y) * scale;
		}
		image.style.transform = `translate(${pos.x}px,${pos.y}px) scale(${scale},${scale})`;
		for (var i = 0; i < imgArr.length; i++)
		{
			imgArr[i].style.transform = `translate(${imgPos[i].x * imageScaleFactor * scale + pos.x}px,${imgPos[i].y * imageScaleFactor * scale + pos.y}px) scale(${scale * iconScaleFactor},${scale * iconScaleFactor})`;
		}
		prevPointerPosition.x = averagePos.x;
		prevPointerPosition.y = averagePos.y;
	}
})

img.addEventListener('wheel', event => {
	if (!isSetup)
	{
		return;
	}
	event.preventDefault();
	
	pointer.x = event.pageX - container.offsetLeft;
	pointer.y = event.pageY - container.offsetTop;
	target.x = (pointer.x - pos.x) / scale;
	target.y = (pointer.y - pos.y) / scale;
	
	scale *= -Math.sign(event.deltaY) * speed + 1;
	
	scale = Math.max(minScale, Math.min(maxScale, scale));

	pos.x = -target.x * scale + pointer.x;
	pos.y = -target.y * scale + pointer.y;

	if (pos.x > 0)
	{
		pos.x = 0;
	}
	if (pos.y > 0)
	{
		pos.y = 0;
	}
	if (size.w - pos.x > (size.w + overflow.x) * scale)
	{
		pos.x = size.w - (size.w + overflow.x) * scale;
	}
	if (size.h - pos.y > (size.h + overflow.y) * scale)
	{
		pos.y = size.h - (size.h + overflow.y) * scale;
	}
	image.style.transform = `translate(${pos.x}px,${pos.y}px) scale(${scale},${scale})`;
	for (var i = 0; i < imgArr.length; i++)
	{
		imgArr[i].style.transform = `translate(${imgPos[i].x * imageScaleFactor * scale + pos.x}px,${imgPos[i].y * imageScaleFactor * scale + pos.y}px) scale(${scale * iconScaleFactor},${scale * iconScaleFactor})`;
	}
}, { passive: false });

img.addEventListener('mouseenter', event => {
	isOverImage = true;
}, false)

img.addEventListener('mouseleave', event => {
	isOverImage = false;
	isDragging = false;
}, false)


img.addEventListener('mousedown', event => {
	if (!isSetup || !isOverImage)
	{
		return;
	}
	event.preventDefault();
	isDragging = true;
	prevPointerPosition.x = event.pageX;
	prevPointerPosition.y = event.pageY;
}, { passive: false })

img.addEventListener('mouseup', event => {
	if (!isSetup)
	{
		return;
	}
	isDragging = false;
}, false)

img.addEventListener('mousemove', event => {
	if (!isSetup || !isOverImage)
	{
		return;
	}
	if (isDragging)
	{
		pos.x += event.pageX - prevPointerPosition.x;
		pos.y += event.pageY - prevPointerPosition.y;
		if (pos.x > 0)
		{
			pos.x = 0;
		}
		if (pos.y > 0)
		{
			pos.y = 0;
		}
		if (size.w - pos.x > (size.w + overflow.x) * scale)
		{
			pos.x = size.w - (size.w + overflow.x) * scale;
		}
		if (size.h - pos.y > (size.h + overflow.y) * scale)
		{
			pos.y = size.h - (size.h + overflow.y) * scale;
		}
		image.style.transform = `translate(${pos.x}px,${pos.y}px) scale(${scale},${scale})`;
		for (var i = 0; i < imgArr.length; i++)
		{
			imgArr[i].style.transform = `translate(${imgPos[i].x * imageScaleFactor * scale + pos.x}px,${imgPos[i].y * imageScaleFactor * scale + pos.y}px) scale(${scale * iconScaleFactor},${scale * iconScaleFactor})`;
		}
	}
	prevPointerPosition.x = event.pageX;
	prevPointerPosition.y = event.pageY;
}, false)