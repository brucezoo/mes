<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/12/4
 * Time: 10:53 AM
 */
$router->get('NewOldMaterialCode/newOldCodeMaterialIndex','NewOldMaterialCode\NewOldMaterialCodeController@newOldCodeMaterialIndex');
$router->post('NewOldMaterialCode/importNewOldMaterialCode','NewOldMaterialCode\NewOldMaterialCodeController@importNewOldMaterialCode');