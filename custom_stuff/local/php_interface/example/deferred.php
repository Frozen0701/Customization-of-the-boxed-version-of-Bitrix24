<?php
defined('B_PROLOG_INCLUDED') || die;

use Bitrix\Main\Context;
use Bitrix\Main\EventManager;
use Bitrix\Main\UI\Extension;

Extension::load('ui.buttons');
Extension::load('ui.buttons.icons');

/* Пример 1: Добавляем кнопку */
ob_start();
?>
<div class="pagetitle-container">
    <a href="#" class="ui-btn ui-btn-light-border ui-btn-icon-info">Отчет</a>
</div>
<?
$customHtml = ob_get_clean();
$APPLICATION->AddViewContent('inside_pagetitle', $customHtml, 20000);


/* Дамп данных для всех отложенных функций. */
$eventManager = EventManager::getInstance();
$eventManager->addEventHandlerCompatible('main', 'OnAfterEpilog', 'dumpViews');

function dumpViews() {
    global $APPLICATION;
    //d($APPLICATION->__view);

    $context = Context::getCurrent();
    $request = $context->getRequest();

    //d($request->toArray());
}