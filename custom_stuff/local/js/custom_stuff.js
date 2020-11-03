var CustomStuff = BX.namespace('CustomStuff');

CustomStuff.helloWorld = function () {
    alert(BX.message('CUSTOM_STUFF_HELLO_WORLD'));
};


// Пример 1. Кнопка "Поблагодарить сотрудника".

CustomStuff.createThankButton = function () {

    var panelWidget = BX.findChildByClassName(document, 'user-profile-events', true);
    var panelCategoryWidget = BX.findChildByClassName(panelWidget, 'user-profile-events-cont', true);

    var thankButton = BX.create(
        'a',
        {
            attrs: {
                className: 'user-profile-events-item',
                href: 'javascript:void(0);'
            },
            html: '<i></i> ' + BX.message('CUSTOM_STUFF_THANK_BUTTON')
        }
    );

    BX.bind(thankButton, 'click', CustomStuff.showThankPopup);
    panelCategoryWidget.appendChild(thankButton);
};

CustomStuff.showThankPopup = function () {

    if (CustomStuff.thankPopup) {
        CustomStuff.thankPopup.close();
        CustomStuff.thankPopup.destroy();
    }

    CustomStuff.thankPopup = new BX.PopupWindow(
        'thank',
        null,
        {
            width: 600,
            height: 400,
            closeByEsc: true,
            closeIcon: true,
            overlay: {
                opacity: 50,
                backgroundColor: '#000'
            },
            titleBar: BX.message('CUSTOM_STUFF_POPUP_TITLE'),
            content: BX.create(
                'div',
                {
                    html: '<p>' + BX.message('CUSTOM_STUFF_POPUP_DESCR') + '</p><textarea></textarea>'
                }
            ),
            buttons: [
                new BX.PopupWindowButton({
                    text: BX.message('CUSTOM_STUFF_POPUP_BUTTON'),
                    className: 'popup-window-button-accept',
                    events: {
                        click: CustomStuff.helloWorld
                    }
                })
            ]
        }
    );

    CustomStuff.thankPopup.show();
};


// Пример 2. Создание документа из шаблона.

CustomStuff.enableDiskTemplates = function () {
    BX.addCustomEvent(
        'onAfterPopupShow',
        CustomStuff.addTemplatesToPopup
    );
};

/**
 * @param {BX.PopupWindow} popup
 */
CustomStuff.addTemplatesToPopup = function (popup) {

if (popup.uniquePopupId != 'bx-disk-create-file') {
    return;
}

if (popup.templatesAdded) {
    return;
}

BX.ajax.get(
    '/local/tools/custom_stuff/disk_templates.php',
    { sessid: BX.bitrix_sessid() },
    function (response) {

        var diskContentDiv = BX.findChildByClassName(popup.contentContainer, 'bx-disk-popup-content', true);
        BX.adjust(
            diskContentDiv,
            {
                style: {
                    'padding-bottom': 0,
                    'padding-top': 0
                }
            }
        );

        var templatesDiv = BX.create('div', { html: response });
        popup.contentContainer.appendChild(templatesDiv);
    }
);

popup.templatesAdded = true;
};



// Пример 3. Добавляем hello world в карточку канбана.

CustomStuff.extendKanbanOnFirstLoad = function () {

    if (CustomStuff.kanbanTimer > 0) {
        return;
    }

    CustomStuff.kanbanTimer = setInterval(
        function () {
            var mainKanbanDiv = BX.findChildByClassName(document, 'main-kanban', true);
            if (mainKanbanDiv) {
                clearInterval(CustomStuff.kanbanTimer);
                CustomStuff.addHelloWorldToKanban();
            }
        },
        100
    );
};

CustomStuff.addHelloWorldToKanban = function () {

    var kanbanCards = BX.findChildrenByClassName(document, 'main-kanban-item', true);

    for (var cardIndex in kanbanCards) {
        var date = BX.findChildByClassName(kanbanCards[cardIndex], 'crm-kanban-item-date', true);

        var helloWorld = BX.create('span', { text: 'Hello World!' });

        BX.insertAfter(helloWorld, date);
    }
};



// Пример 4. Подтверждение на создание внешней ссылки в диске.

CustomStuff.overrideDiskShare = function () {

    if (!BX.Disk || !BX.Disk.FolderListClass) {
        return;
    }

    var originalMethod = BX.Disk.FolderListClass.prototype.openExternalLinkDetailSettingsWithEditing;

    BX.Disk.FolderListClass.prototype.openExternalLinkDetailSettingsWithEditing = function (objectId) {
        var self = this;
        CustomStuff.showShareConfirmationDialog(function () {
            originalMethod.apply(self, [objectId])
        });
    };
};

CustomStuff.showShareConfirmationDialog = function (onAgree) {

    var confirmationPopup = new BX.PopupWindow(
        'shareConfirmation',
        null,
        {
            width: 400,
            height: 100,
            closeByEsc: true,
            closeIcon: true,
            overlay: {
                opacity: 50,
                backgroundColor: '#000'
            },
            titleBar: BX.message('CUSTOM_STUFF_SHARE_CONFIRMATION_TITLE'),
            content: BX.create(
                'div',
                {
                    html: BX.message('CUSTOM_STUFF_SHARE_CONFIRMATION')
                }
            ),
            buttons: [
                new BX.PopupWindowButton({
                    text: BX.message('CUSTOM_STUFF_POPUP_BUTTON_YES'),
                    className: 'popup-window-button-accept',
                    events: {
                        click: function () {
                            confirmationPopup.close();
                            confirmationPopup.destroy();
                            onAgree();
                        }
                    }
                }),
                new BX.PopupWindowButton({
                    text: BX.message('CUSTOM_STUFF_POPUP_BUTTON_NO'),
                    events: {
                        click: function () {
                            confirmationPopup.close();
                            confirmationPopup.destroy();
                        }
                    }
                })
            ]
        }
    );

    confirmationPopup.show();
};



// Пример 5. Предупреждение перед открытием боковой панели.

CustomStuff.enableCreateGroupConfirmation = function () {
    BX.addCustomEvent(
        'SidePanel.Slider:onOpen',
        CustomStuff.showCreateGroupConfirmation
    );
};

CustomStuff.showCreateGroupConfirmation = function (event) {

    var slider = event.getSlider();

    if (!slider.getUrl().endsWith('/groups/create/')) {
        return;
    }

    if (CustomStuff.isConfirmingGroupCreate) {
        CustomStuff.isConfirmingGroupCreate = false;
    } else {
        event.denyAction();
        CustomStuff.showGroupCreateConfirmationDialog(function () {
            BX.SidePanel.Instance.open(slider.getUrl(), slider.options);
        });
        CustomStuff.isConfirmingGroupCreate = true;
    }
};

CustomStuff.showGroupCreateConfirmationDialog = function (onAgree) {

    var confirmationPopup = new BX.PopupWindow(
        'groupCreateConfirmation',
        null,
        {
            width: 400,
            height: 100,
            closeByEsc: true,
            closeIcon: true,
            overlay: {
                opacity: 50,
                backgroundColor: '#000'
            },
            titleBar: BX.message('CUSTOM_STUFF_GROUP_CREATE_CONFIRMATION_TITLE'),
            content: BX.create(
                'div',
                {
                    html: BX.message('CUSTOM_STUFF_GROUP_CREATE_CONFIRMATION')
                }
            ),
            buttons: [
                new BX.PopupWindowButton({
                    text: BX.message('CUSTOM_STUFF_POPUP_BUTTON_YES'),
                    className: 'popup-window-button-accept',
                    events: {
                        click: function () {
                            onAgree();
                            confirmationPopup.close();
                            confirmationPopup.destroy();
                        }
                    }
                }),
                new BX.PopupWindowButton({
                    text: BX.message('CUSTOM_STUFF_POPUP_BUTTON_NO'),
                    events: {
                        click: function () {
                            confirmationPopup.close();
                            confirmationPopup.destroy();
                        }
                    }
                })
            ],
            events: {
                onPopupClose: function () {
                    CustomStuff.isConfirmingGroupCreate = false;
                }
            }
        }
    );

    confirmationPopup.show();
};