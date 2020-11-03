<?php
defined('B_PROLOG_INCLUDED') || die;

use Bitrix\Main\EventManager;
use Bitrix\Main\UI\Extension;
use Bitrix\Main\UserField\TypeBase;


$eventManager = EventManager::getInstance();
$eventManager->addEventHandlerCompatible('main', 'OnUserTypeBuildList', array('MyUserType', 'GetUserTypeDescription'));

class MyUserType extends TypeBase
{
    const USER_TYPE_ID = 'myusertype';

    function GetUserTypeDescription()
    {
        return array(
            'USER_TYPE_ID' => static::USER_TYPE_ID,
            'CLASS_NAME' => __CLASS__,
            'DESCRIPTION' => 'Кастомное поле',
            'BASE_TYPE' => \CUserTypeManager::BASE_TYPE_STRING,
            'EDIT_CALLBACK' => array(__CLASS__, 'GetPublicEdit'),
            'VIEW_CALLBACK' => array(__CLASS__, 'GetPublicView'),
        );
    }

    function GetDBColumnType($arUserField)
    {
        global $DB;
        switch(strtolower($DB->type))
        {
            case "mysql":
                return "text";
            case "oracle":
                return "varchar2(2000 char)";
            case "mssql":
                return "varchar(2000)";
        }
    }

    public static function GetPublicView($arUserField, $arAdditionalParameters = array())
    {
        Extension::load('ui.buttons');
        return '<a href="#" class="ui-btn ui-btn-danger">Button From Custom Field</a>';
    }

    public static function GetPublicEdit($arUserField, $arAdditionalParameters = array())
    {
        Extension::load('ui.buttons');
        $name = static::getFieldName($arUserField, $arAdditionalParameters);
        return '<input type="hidden" name="' . $name . '" value="1"/><a href="#" class="ui-btn ui-btn-success">Button From Custom Field</a>';
    }
}