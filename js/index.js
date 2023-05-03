const mapNames = Object.freeze({
	KURKEN: 0,
	MAINLAND: 1,
	CLERIA: 2,
	NEMED: 3,
	ORIM: 4,
	CODE: 5
});

const site = document.querySelector('.site');
const container = document.querySelector('.container');
const image = document.querySelector('.image');
const img = document.getElementById('currentMap');
const button = document.querySelector('button');
const itemMarker = document.querySelector('.itemMarkers');
const numberFoundLabel = document.getElementById('numberFound');

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
let tooltipData = [];

function calculateAveragePos(event)
{
	var averagePos = { x: 0, y: 0 };
	for (let i = 0; i < event.touches.length; i++)
	{
		averagePos.x += event.touches[i].clientX;
		averagePos.y += event.touches[i].clientY;
	}
	averagePos.x /= event.touches.length;
	averagePos.y /= event.touches.length;
	averagePos.x += site.scrollLeft;
	averagePos.y += site.scrollTop;
	return averagePos;
}

function updatePrevAveragePos(event)
{
	prevPointerPosition = calculateAveragePos(event);
}

function handleTouchStart(event)
{
	event.preventDefault();
	if (event.touches.length == 2)
	{
		prevPointerDist = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
	}
	isDragging = true;
	updatePrevAveragePos(event);
}

function handleTouchStartItem(event)
{
	var parentElement = event.target.parentElement;
	if (parentElement.style.zIndex.localeCompare("3") == 0)
	{
		parentElement.style.zIndex = "2";
		parentElement.removeChild(parentElement.lastElementChild);
	}
	else
	{
		parentElement.style.zIndex = "3";
		var addTooltipBox = document.createElement("span");
		addTooltipBox.className = "tooltiptext";
		let dotIdNum = parseInt(parentElement.id.substring(3));
		addTooltipBox.innerHTML += tooltipData[dotIdNum];
		addTooltipBox.style.width = `fit-content`
		addTooltipBox.style.fontSize = `10vw`;
		parentElement.append(addTooltipBox);
		addTooltipBox.style.marginLeft = `-${addTooltipBox.offsetWidth / 2}px`
	}
	handleTouchStart(event);
}

function handleTouchEnd(event)
{
	event.preventDefault();
	if (event.touches.length == 0)
	{
		isDragging = false;
	}
	updatePrevAveragePos(event);
}

function handleTouchCancel(event)
{
	event.preventDefault();
	if (event.touches.length == 0)
	{
		isDragging = false;
	}
	updatePrevAveragePos(event);
}

function handleTouchMove(event)
{
	event.preventDefault();
	if (isDragging)
	{
		var averagePos = calculateAveragePos(event);
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
		prevPointerPosition = averagePos;
	}
}

function handleWheelScroll(event)
{
	if (!isSetup)
	{
		return;
	}
	event.preventDefault();
	
	pointer.x = event.layerX - container.offsetLeft;
	pointer.y = event.layerY - container.offsetTop;
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
}

function handleMouseEnter(event)
{
	isOverImage = true;
}

function handleMouseLeave(event)
{
	isOverImage = false;
	var borderSize = 1;
	if (event.layerX < container.offsetLeft + borderSize || event.layerX > container.clientWidth + container.offsetLeft - borderSize ||
		event.layerY < container.offsetTop + borderSize || event.layerY > container.clientHeight + container.offsetTop - borderSize)
	{
		isDragging = false;
	}
}

function handleMouseEnterItem(event)
{
	var parentElement = event.target.parentElement;
	parentElement.style.zIndex = "3";

	var addTooltipBox = document.createElement("span");
	addTooltipBox.className = "tooltiptext";
	let dotIdNum = parseInt(parentElement.id.substring(3));
	addTooltipBox.innerHTML += tooltipData[dotIdNum];
	addTooltipBox.style.width = `fit-content`
	addTooltipBox.style.fontSize = `10vw`;
	parentElement.append(addTooltipBox);
	addTooltipBox.style.marginLeft = `-${addTooltipBox.offsetWidth / 2}px`
	handleMouseEnter(event);
}

function handleMouseLeaveItem(event)
{
	var parentElement = event.target.parentElement;
	parentElement.style.zIndex = "2";
	parentElement.removeChild(parentElement.lastElementChild);
	handleMouseLeave(event);
}

function handleMouseDown(event)
{
	if (!isSetup || !isOverImage)
	{
		return;
	}
	event.preventDefault();
	isDragging = true;
	prevPointerPosition.x = event.layerX;
	prevPointerPosition.y = event.layerY;
}

function handleMouseUp(event)
{
	if (!isSetup)
	{
		return;
	}
	isDragging = false;
}

function handleMouseMove(event)
{
	if (!isSetup || !isOverImage)
	{
		return;
	}
	if (isDragging)
	{
		pos.x += event.layerX - prevPointerPosition.x;
		pos.y += event.layerY - prevPointerPosition.y;
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
	prevPointerPosition.x = event.layerX;
	prevPointerPosition.y = event.layerY;
}

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
	tooltipData = [];
	var term = $("#items").val().toLowerCase();
	if (!term)
	{
		return 0;
	}
	var selectMenu = document.getElementById("maps");
	var selectedMapName = selectMenu.options[selectMenu.selectedIndex].value;
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
	var gatheringToolNames = ["Hand Gathering", "Rod Gathering", "Sickle Gathering", "Axe Gathering", "Hammer Gathering", "Net Gathering"];
	let numberFound = [0, 0, 0, 0, 0, 0];
	
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
		addDot.id = "dot" + imgArr.length;
		var addImage = document.createElement("img");
		addImage.src = imagePath;
		addDot.append(addImage);
		addImageBox.append(addDot);
		itemMarker.append(addImageBox);

		addImage.addEventListener('touchstart', handleTouchStartItem, { passive: false });

		addImage.addEventListener('touchend', handleTouchEnd, { passive: false });

		addImage.addEventListener('touchcancel', handleTouchCancel, { passive: false });

		addImage.addEventListener('touchmove', handleTouchMove, { passive: false });

		addImage.addEventListener('wheel', handleWheelScroll, { passive: false });

		addImage.addEventListener('mouseenter', handleMouseEnterItem, { passive: false });

		addImage.addEventListener('mouseleave', handleMouseLeaveItem, { passive: false });

		addImage.addEventListener('mousedown', handleMouseDown, { passive: false });

		addImage.addEventListener('mouseup', handleMouseUp, { passive: false });

		addImage.addEventListener('mousemove', handleMouseMove, { passive: false });

		imgArr.push(addDot);
		imgPos.push({ x: pixelX, y: pixelY });
	}

	for (let curMapIndex = 0; curMapIndex < areaNames.length; curMapIndex++)
	{
		for (let i = areaStartIndex[curMapIndex]; i < areaStartIndex[curMapIndex + 1]; i++)
		{
			var flag = false;
			for (let j = 0; !flag && j < gatheringToolMaxRank.length; j++)
			{
				for (let k = 0; k < 3; k++)
				{
					if (gatheringToolMaxRank[j] <= k) break;
					// Base game lookup
					if (itemLookupTableLocalized[i][j * 6 + k * 2 + 5])
					{
						if (itemLookupTableLocalized[i][j * 6 + k * 2 + 5].toLowerCase().localeCompare(term) == 0)
						{
							flag = true;
							break;
						}
					}
					// DLC lookup
					if (parseInt(itemLookupTableLocalized[i][4]) != 0 && itemLookupTableLocalized[i][j * 6 + k * 2 + 5 + 36])
					{
						if (parseInt(itemLookupTableLocalized[i][4]) == 1 && !$("#ArtOfAdventureCheckbox")[0].checked) continue;
						if (parseInt(itemLookupTableLocalized[i][4]) == 2 && !$("#AlchemyMysteriesCheckbox")[0].checked) continue;
						if (itemLookupTableLocalized[i][j * 6 + k * 2 + 5 + 36].toLowerCase().localeCompare(term) == 0)
						{
							flag = true;
							break;
						}
					}
				}
			}
			if (flag)
			{
				numberFound[curMapIndex]++;
				if (selectedMapIndex == curMapIndex)
				{
					addImageToMap("img/GatheringHand.png", parseInt(itemLookupTableLocalized[i][1]), parseInt(itemLookupTableLocalized[i][3]));
					var itemString = "";
					for (let j = 0; j < gatheringToolMaxRank.length; j++)
					{
						var curGatheringString = "";
						// Base game items
						for (let k = 0; k < 3; k++)
						{
							if (itemLookupTableLocalized[i][j * 6 + k * 2 + 5])
							{
								curGatheringString += itemLookupTableLocalized[i][j * 6 + k * 2 + 5] + " ";
								curGatheringString += itemLookupTableLocalized[i][j * 6 + k * 2 + 5 + 1];
								curGatheringString += "<br>";
							}
						}
						// DLC items
						if (parseInt(itemLookupTableLocalized[i][4]) != 0)
						{
							for (let k = 0; k < 3; k++)
							{
								if (itemLookupTableLocalized[i][j * 6 + k * 2 + 5 + 36])
								{
									curGatheringString += itemLookupTableLocalized[i][j * 6 + k * 2 + 5 + 36] + " ";
									curGatheringString += itemLookupTableLocalized[i][j * 6 + k * 2 + 5 + 36 + 1] + " (DLC)";
									curGatheringString += "<br>";
								}
							}
						}
						if (curGatheringString)
						{
							itemString += trans(gatheringToolNames[j], "ui") + "<br>";
							itemString += curGatheringString + "<br>";
						}
					}
					tooltipData.push(itemString.substring(0, itemString.length - 4));
				}
			}
		}

		for (let i = areaStartIndexMonster[curMapIndex]; i < areaStartIndexMonster[curMapIndex + 1]; i++)
		{
			var flag = false;
			for (let j = 0; !flag && j < 4; j++)
			{
				if (!monsterDropLookupTableLocalized[i][j + 6]) continue;
				if (monsterDropLookupTableLocalized[i][j + 6].toLowerCase().localeCompare(term) == 0)
				{
					flag = true;
					break;
				}
			}
			var itemString = monsterDropLookupTableLocalized[i][4] + "<br><br>";
			for (let j = 0; j < 4; j++)
			{
				if (monsterDropLookupTableLocalized[i][j + 6])
				{
					itemString += monsterDropLookupTableLocalized[i][j + 6];
					itemString += "<br>";
				}
			}
			if (flag)
			{
				numberFound[curMapIndex]++;
				if (selectedMapIndex == curMapIndex)
				{
					addImageToMap("img/Monster/Monster" + monsterDropLookupTableLocalized[i][5] + ".png", parseInt(monsterDropLookupTableLocalized[i][1]), parseInt(monsterDropLookupTableLocalized[i][3]));
					tooltipData.push(itemString.substring(0, itemString.length - 4));
				}
			}
		}
	}
	return numberFound;
}

img.onload = function() {
	var numberFound = queryItems();
	var numberFoundLabelText = "";
	for (let i = 0; i < areaNames.length; i++)
	{
		numberFoundLabelText += trans("$1 in $2", "ui", numberFound[i] || 0, trans(areaNames[i], "ui")) + "<br>";
	}
	numberFoundLabel.innerHTML = numberFoundLabelText;
	setup();
}
if (img.complete)
{
	setup();
}

button.onclick = function() {
	isSetup = false;
	var selectMenu = document.getElementById("maps");
	var selectedMap = selectMenu.options[selectMenu.selectedIndex].value;
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

img.addEventListener('touchstart', handleTouchStart, { passive: false });

img.addEventListener('touchend', handleTouchEnd, { passive: false });

img.addEventListener('touchcancel', handleTouchCancel, { passive: false });

img.addEventListener('touchmove', handleTouchMove, { passive: false });

img.addEventListener('wheel', handleWheelScroll, { passive: false });

img.addEventListener('mouseenter', handleMouseEnter, { passive: false });

img.addEventListener('mouseleave', handleMouseLeave, { passive: false });

img.addEventListener('mousedown', handleMouseDown, { passive: false });

img.addEventListener('mouseup', handleMouseUp, { passive: false });

img.addEventListener('mousemove', handleMouseMove, { passive: false });