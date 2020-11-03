<?php

use Bitrix\Main\Config\Option;
use Bitrix\Main\Page\Asset;

defined('B_PROLOG_INCLUDED') || die;

// Основной код.
CJSCore::RegisterExt(
    'custom_stuff',
    array(
        'js' => '/local/js/custom_stuff.js',
        'lang' => '/local/lang/' . LANGUAGE_ID . '/custom_stuff.js.php',
        'css' => '/local/css/custom_stuff.css',
        'rel' => array('ajax')
    )
);

CJSCore::Init('custom_stuff');


// Запускаем что надо.

$asset = Asset::getInstance();

$profileTemplates = array(
    'profile' => ltrim(Option::get('intranet', 'path_user', '', SITE_ID), '/')
);
if (CComponentEngine::parseComponentPath('/', $profileTemplates, $arVars) == 'profile') {
    $asset->addString('<script>BX.ready(function () { BX.CustomStuff.createThankButton(); });</script>');
}

$asset->addString('<script>BX.ready(function () { BX.CustomStuff.enableDiskTemplates(); });</script>');
$asset->addString('<script>BX.ready(function () { BX.CustomStuff.overrideDiskShare(); });</script>');
$asset->addString('<script>BX.ready(function () { BX.CustomStuff.enableCreateGroupConfirmation(); });</script>');

if (CSite::InDir('/crm/lead/kanban/')) {
    $asset->addString('<script>BX.ready(function () { BX.CustomStuff.extendKanbanOnFirstLoad(); });</script>');
}