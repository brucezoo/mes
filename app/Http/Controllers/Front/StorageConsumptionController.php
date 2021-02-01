<?php 
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 其他入库
 * @author  liming
 */

class StorageConsumptionController extends Controller
{
    public function storageConsumptionIndex()
    {
        return view('warehouse.storageconsumption_index');
    }

    public function addStorageConsumption()
    {
        return view('warehouse.storageconsumption_add');
    }

    public function editStorageConsumption()
    {
        return view('warehouse.storageconsumption_edit');
    }

    public function viewStorageConsumption()
    {
        return view('warehouse.storageconsumption_view');
    }

}