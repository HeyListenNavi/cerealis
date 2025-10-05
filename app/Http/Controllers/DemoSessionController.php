<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Str;

class DemoSessionController extends Controller
{
    public function reset()
    {
        $user = User::where('email', '=', 'demo@innovatec.com')->first();

        if (!$user) {
            return "Demo user not found.";
        }

        $newPassword = Str::random(8);
        $user->password = Hash::make($newPassword);
        $user->save();

        DB::table('sessions')->where('user_id', $user->id)->delete();

        return view('demo-reset-success', ['password' => $newPassword]);
    }
}
