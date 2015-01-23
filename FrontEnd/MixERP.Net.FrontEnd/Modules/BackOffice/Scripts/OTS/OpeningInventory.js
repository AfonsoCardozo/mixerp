﻿var addRowButton = $("#AddRowButton");
var amountInputText = $("#AmountInputText");

var buttons = $("#Buttons");

var itemCodeInputText = $("#ItemCodeInputText");
var itemSelect = $("#ItemSelect");
var itemIdHidden = $("#ItemIdHidden");

var openingInventoryGridViewHidden = $("#OpeningInventoryGridViewHidden");
var openingInventoryGridView = $("#OpeningInventoryGridView");

var quantityInputText = $("#QuantityInputText");

var storeSelect = $("#StoreSelect");
var storeIdHidden = $("#StoreIdHidden");

var totalInputText = $("#TotalInputText");
var tranBook = "OpeningInventory";

var unitSelect = $("#UnitSelect");
var unitIdHidden = $("#UnitIdHidden");
var unitNameHidden = $("#UnitNameHidden");

var amount;
var data;
var itemCode;
var itemName;
var quantity;
var storeName;
var total;
var unitName;
var url;

$(document).ready(function () {
    initializeAjaxData();
    createCascadingPair(itemSelect, itemCodeInputText);
    itemCodeInputText.focus();
    addShortcuts();
});

function initializeAjaxData() {
    loadItems();
    loadStores();
    loadUnits();

    itemSelect.blur(function () {
        itemSelect_OnBlur();
    });
    itemSelect.change(function () {
        itemSelect_OnBlur();
    });

};

function loadItems() {
    url = "/Modules/Inventory/Services/ItemData.asmx/GetItems";
    data = appendParameter("", "tranBook", tranBook);
    data = getData(data);

    ajaxDataBind(url, itemSelect, data);
};

function loadStores() {
    if (storeSelect.length) {
        url = "/Modules/Inventory/Services/ItemData.asmx/GetStores";
        ajaxDataBind(url, storeSelect, data);
    };
};

function loadUnits() {
    var itemCode = itemCodeInputText.val();

    url = "/Modules/Inventory/Services/ItemData.asmx/GetUnits";
    data = appendParameter("", "itemCode", itemCode);
    data = getData(data);

    var selectedValue = unitIdHidden.val();

    ajaxDataBind(url, unitSelect, data, selectedValue);
};

function addShortcuts() {
    shortcut.add("ALT+C", function () {
        itemCodeInputText.focus();
    });

    shortcut.add("CTRL+I", function () {
        itemSelect.focus();
    });

    shortcut.add("CTRL+Q", function () {
        quantityInputText.focus();
    });

    shortcut.add("CTRL+U", function () {
        unitSelect.focus();
    });

    shortcut.add("CTRL+ENTER", function () {
        addRowButton.click();
    });


};

addRowButton.click(function () {
    itemCode = itemCodeInputText.val();
    if (isNullOrWhiteSpace(itemCode)) {
        makeDirty(itemCodeInputText);
        return;
    };

    removeDirty(itemCodeInputText);

    itemName = itemSelect.getSelectedText();



    storeName = parseInt(storeSelect.getSelectedValue());
    if (!storeName) {
        makeDirty(storeSelect);
        return;
    }

    storeName = storeSelect.getSelectedText();
    removeDirty(storeSelect);


    quantity = parseInt2(quantityInputText.val());
    if (isNullOrWhiteSpace(quantity)) {
        makeDirty(quantityInputText);
        return;
    };

    removeDirty(quantityInputText);


    unitName = parseInt2(unitSelect.getSelectedValue());
    if (!unitName) {
        makeDirty(unitSelect);
        return;
    }

    unitName = unitSelect.getSelectedText();
    removeDirty(unitSelect);


    amount = parseFloat2(amountInputText.val());
    if (isNullOrWhiteSpace(amount)) {
        makeDirty(amountInputText);
        return;
    }


    total = amount * quantity;

    addRowToTable(itemCode, itemName, storeName, quantity, unitName, amount, total);

    itemCodeInputText.val("");
    quantityInputText.val("");
    amountInputText.val("");
    totalInputText.val("");
    itemCodeInputText.focus();

});

function addRowToTable(itemCode, itemName, storeName, quantity, unitName, amount, total) {
    var grid = openingInventoryGridView;
    var rows = grid.find("tr:not(:last-child)");
    var result = quantity * amount;
    var match = false;

    rows.each(function () {
        var row = $(this);
        if (getColumnText(row, 0) === itemCode &&
            getColumnText(row, 1) === itemName &&
            getColumnText(row, 2) === storeName &&
            getColumnText(row, 4) === unitName &&
            parseFloat(getColumnText(row, 5)) === amount) {
            setColumnText(row, 3, parseFloat2(getColumnText(row, 3)) + getFormattedNumber(quantity));
            setColumnText(row, 6, parseFloat2(getColumnText(row, 6)) + getFormattedNumber(result));

            addDanger(row);

            match = true;
            return;
        };
    });

    if (!match) {
        var html = "<tr><td>" + itemCode + "</td>" +
            "<td>" + itemName + "</td>" +
            "<td>" + storeName + "</td>" +
            "<td class='text-right'>" + getFormattedNumber(quantity) + "</td>" +
            "<td>" + unitName + "</td>" +
            "<td class='text-right'>" + getFormattedNumber(amount) + "</td>" +
            "<td class='text-right'>" + getFormattedNumber(total) + "</td>" +
            "<td><a class='pointer' onclick='removeRow($(this));summate();'><i class='ui delete icon'></i></a><a class='pointer' onclick='toggleDanger($(this));'>" +
            "<i class='ui pointer check mark icon'></a></i><a class='pointer' onclick='toggleSuccess($(this));'>" +
            "<i class='ui pointer thumbs up icon'></i></a></td></tr>";


        openingInventoryGridView.find("tr:last").before(html);
    }
};

function itemSelect_OnBlur() {
    itemCodeInputText.val(itemSelect.getSelectedValue());
    loadUnits();
};

unitSelect.change(function () {
    unitNameHidden.val($(this).getSelectedText());
    unitIdHidden.val($(this).getSelectedValue());
});

quantityInputText.blur(function () {
    calculateTotal();
});

amountInputText.blur(function () {
    calculateTotal();
});

var calculateTotal = function () {
    var quatity = parseInt2(quantityInputText.val());
    var amount = parseFloat2(amountInputText.val());
    var total = quatity * amount;

    totalInputText.val(total);
};