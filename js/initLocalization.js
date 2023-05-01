const textSelector = {
	'title': "Ryza 3 Material Map Finder",
	'label[for="maps"]': "Choose a map:",
	'#maps option:nth-child(1)': "Kurken",
	'#maps option:nth-child(2)': "Mainland",
	'#maps option:nth-child(3)': "Cleria",
	'#maps option:nth-child(4)': "Nemed",
	'#maps option:nth-child(5)': "Orim",
	'#maps option:nth-child(6)': "Code",
	'label[for="items"]': "Choose an item:",
	'#filterLabel': "Filter Gathering Tool:",
	'label[for="handRankDropdown"]': "Hand Maximum Rank",
	'#handRankDropdown option:nth-child(1)': "None",
	'#handRankDropdown option:nth-child(2)': "Rank One",
	'#handRankDropdown option:nth-child(3)': "Rank Two",
	'#handRankDropdown option:nth-child(4)': "Rank Three",
	'label[for="rodRankDropdown"]': "Rod Maximum Rank",
	'#rodRankDropdown option:nth-child(1)': "None",
	'#rodRankDropdown option:nth-child(2)': "Rank One",
	'#rodRankDropdown option:nth-child(3)': "Rank Two",
	'#rodRankDropdown option:nth-child(4)': "Rank Three",
	'label[for="sickleRankDropdown"]': "Sickle Maximum Rank",
	'#sickleRankDropdown option:nth-child(1)': "None",
	'#sickleRankDropdown option:nth-child(2)': "Rank One",
	'#sickleRankDropdown option:nth-child(3)': "Rank Two",
	'#sickleRankDropdown option:nth-child(4)': "Rank Three",
	'label[for="axeRankDropdown"]': "Axe Maximum Rank",
	'#axeRankDropdown option:nth-child(1)': "None",
	'#axeRankDropdown option:nth-child(2)': "Rank One",
	'#axeRankDropdown option:nth-child(3)': "Rank Two",
	'#axeRankDropdown option:nth-child(4)': "Rank Three",
	'label[for="hammerRankDropdown"]': "Hammer Maximum Rank",
	'#hammerRankDropdown option:nth-child(1)': "None",
	'#hammerRankDropdown option:nth-child(2)': "Rank One",
	'#hammerRankDropdown option:nth-child(3)': "Rank Two",
	'#hammerRankDropdown option:nth-child(4)': "Rank Three",
	'label[for="netRankDropdown"]': "Net Maximum Rank",
	'#netRankDropdown option:nth-child(1)': "None",
	'#netRankDropdown option:nth-child(2)': "Rank One",
	'#netRankDropdown option:nth-child(3)': "Rank Two",
	'#netRankDropdown option:nth-child(4)': "Rank Three",
	'label[for="AlchemyMysteriesCheckbox"]': "Alchemy Mysteries DLC",
	'label[for="ArtOfAdventureCheckbox"]': "Art of Adventure DLC",
	'.readyButton > button': 'Search',
	'#numberFoundLabel': "Number found:",
};

var localization = {
	"eng": {},
	"jpn": {},
	"chs": {},
	"cht": {},
	"kor": {},
}

language = "eng";
for (let i = 0; i < navigator.languages.length; i++)
{
	let lang = navigator.languages[i];
	if (lang.match(/zh-(?:tw|hk|hant)/i))
	{
		language = "cht";
		break;
	}
	if (lang.match(/^zh/i))
	{
		language = "chs";
		break;
	}
	if (lang.match(/^ja/i))
	{
		language = "jpn";
		break;
	}
	if (lang.match(/^ko/i))
	{
		language = "kor";
		break;
	}
	if (lang.match(/^en/i))
	{
		language = "eng";
		break;
	}
}

function trans(text, category)
{
	let result = text;
	if (
		localization[language] &&
		localization[language][category] &&
		localization[language][category][text]
	)
	{
		result = localization[language][category][text];
	}
	let args = Array.prototype.slice.call(arguments, 2);
	for (let i = args.length; i > 0; i--)
	{
		result = result.replace("$" + i, args[i - 1]);
	}
	return result;
}

function updateLocalization()
{
	for (let selector in textSelector)
	{
		let element = document.querySelector(selector);
		if (element)
		{
			element.textContent = trans(textSelector[selector], "ui");
		}
	}
	for (let i = 0; i < itemLookupTable.length; i++)
	{
		for (let j = 5; j < itemLookupTable[i].length; j += 2)
		{
			if (itemLookupTable[i][j])
			{
				itemLookupTable[i][j] = trans(itemLookupTable[i][j], "item");
			}
		}
	}
	for (let i = 0; i < monsterDropLookupTable.length; i++)
	{
		monsterDropLookupTable[i][4] = trans(monsterDropLookupTable[i][4], "monster");
		for (let j = 6; j < monsterDropLookupTable[i].length; j ++)
		{
			if (monsterDropLookupTable[i][j])
			{
				monsterDropLookupTable[i][j] = trans(monsterDropLookupTable[i][j], "item");
			}
		}
	}
}

window.addEventListener('load', updateLocalization);