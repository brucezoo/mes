<?php

namespace App\Console;

use App\Console\Commands\AutoAuditing;
use App\Console\Commands\AutoFeed;
use App\Console\Commands\BatchRelaseBom;
use App\Console\Commands\CleanDeletedPhoto;
use App\Console\Commands\CleanProcedureRouteRelation;
use App\Console\Commands\DeleteBom;
use App\Console\Commands\DeleteErrorMaterialRequisition;
use App\Console\Commands\GetCompletion;
use App\Console\Commands\GetOrders;
use App\Console\Commands\HandleSapMaterialCategory;
use App\Console\Commands\ImportEmployee;
use App\Console\Commands\ImportSapMaterialAndBom;
use App\Console\Commands\MakeOrder;
use App\Console\Commands\PullWorkOrder;
use App\Console\Commands\SyncRouting;
use App\Console\Commands\TestCron;
use App\Console\Commands\CreateLink;
use App\Console\Commands\CleanAccessory;
use App\Console\Commands\ExportExcel;
use App\Console\Commands\UpdateInspurMaterialCode;
use App\Console\Commands\UpdateWorkCenter;
use Illuminate\Console\Scheduling\Schedule;
use Laravel\Lumen\Console\Kernel as ConsoleKernel;
use App\Console\Commands\InitRoutingExcel;
use App\Console\Commands\GroupRoutingInitData;
use App\Console\Commands\NewGroupRoutingData;
use App\Console\Commands\CreateBomRoutingInOrOutMaterial;
use App\Console\Commands\ImportSapPo;
use App\Console\Commands\ImportSpecialExpend;
use App\Console\Commands\ReleasePo;
use App\Console\Commands\SyncOrderMaterial;
use App\Console\Commands\SyncOrderToMosu;
use App\Console\Commands\ImageUpdate;
use App\Console\Commands\SyncConfirmnumber;
use App\Console\Commands\SyncCareLabel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        GetOrders::class,
        TestCron::class,
        MakeOrder::class,
        GetCompletion::class,
        CreateLink::class,
        CleanAccessory::class,
        CleanDeletedPhoto::class,
        ExportExcel::class,
        HandleSapMaterialCategory::class,
        ImportSapMaterialAndBom::class,
        CleanProcedureRouteRelation::class,
        InitRoutingExcel::class,
        GroupRoutingInitData::class,
        NewGroupRoutingData::class,
        CreateBomRoutingInOrOutMaterial::class,
        DeleteBom::class,
        ImportSapPo::class,
        BatchRelaseBom::class,
        ImportEmployee::class,
        PullWorkOrder::class,
        AutoAuditing::class,
        AutoFeed::class,
        DeleteErrorMaterialRequisition::class,
        ImportSpecialExpend::class,
        UpdateInspurMaterialCode::class,
        ReleasePo::class,
        UpdateWorkCenter::class,
        SyncRouting::class,
        SyncOrderMaterial::class,
        SyncOrderToMosu::class,
        ImageUpdate::class,
        SyncConfirmnumber::class,
        SyncCareLabel::class,
    ];
    /**
     * Define the application's command schedule.
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @author  rick
     * @reviser sam 加入调试模式输出测试
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
//        $schedule->command('orders:get')->dailyAt('00:10');
//        $schedule->command('completion:get')->dailyAt('01:10');
        $schedule->command('clean:deletedPhoto')->dailyAt('01:10');
        $schedule->command('clean:accessory')->twiceDaily(1,2)->everyMinute();
//        $schedule->command('clean:sapSyncDataReq')->withoutOverlapping();
        $schedule->command('clean:procedure-route')->weekly();
        $schedule->command('pull:workOrder')->everyTenMinutes();
        $schedule->command('sync:ordertomosu')->everyMinute();
        $schedule->command('release:production_order')->dailyAt('02:10');
//        if(env('APP_DEBUG') || !empty($_REQUEST['_debug']) ) $schedule->command('cron:test')->everyMinute();
    }


    /**
     * Register the Closure based commands for the application.
     * lumen中阉割掉这个功能
     * @return void
     */
//    protected function commands()
//    {
//        require base_path('routes/console.php');
//    }



}
