<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2019/3/12
 * Time: 10:40 AM
 */

namespace App\Libraries;

/**
 * 适配自制/委外/质检单的洗标文件
 * Interface CareLableStrategy
 * @package App\Libraries
 * @author Bruce.Chu
 */
interface CareLableStrategy
{
    public function getCareLableList();
}