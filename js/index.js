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
let iconScaleFactor = 1;
let imageScaleFactor = 1;

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
	for (let i = areaStartIndex[selectedMapIndex]; i < areaStartIndex[selectedMapIndex + 1]; i++)
	{
		var flag = false;
		for (let j = 0; !flag && j < gatheringToolMaxRank.length; j++)
		{
			for (let k = 0; k < 3; k++)
			{
				if (!itemLookupTable[i][j * 6 + k * 2 + 4]) continue;
				if (gatheringToolMaxRank[j] <= k) break;
				if (itemLookupTable[i][j * 6 + k * 2 + 4].toLowerCase().localeCompare(term) == 0)
				{
					flag = true;
					break;
				}
			}
		}
		if (flag)
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
			let pixelX = parseInt(itemLookupTable[i][1]) * pixelXScale + pixelXShift;
			let pixelY = parseInt(itemLookupTable[i][3]) * pixelYScale + pixelYShift;
			var addImageBox = document.createElement("div");
			addImageBox.className = "imageBox";
			var addDot = document.createElement("div")
			addDot.className = "dot";
			var addImage = document.createElement("img");
			addImage.src = "img/GatheringHand.png";
			addDot.append(addImage);
			addImageBox.append(addDot);
			itemMarker.append(addImageBox);
			imgArr.push(addDot);
			imgPos.push({ x: pixelX, y: pixelY });
			numberFound++;
		}
	}
	return numberFound;
}

img.onload = function() {
	imageScaleFactor = img.width / img.naturalWidth;
	iconScaleFactor = imageScaleFactor / 4;
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
	scale = 1;
	var selectMenu = document.getElementById("maps");
	var selectedMap = selectMenu.options[selectMenu.selectedIndex].text;
	img.src = "img/" + selectedMap + ".jpg";
}

function setup()
{
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
	
	const max_scale = 8;
	const min_scale = 1;
	scale = Math.max(min_scale, Math.min(max_scale, scale));

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