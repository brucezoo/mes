<?php
namespace App\Http\Controllers;
use Laravel\Lumen\Routing\Controller as BaseController;
use Symfony\Component\HttpFoundation\Request;

class ApiJwtController extends BaseController
{

    protected $model;

    public function __construct()
    {
    }
}