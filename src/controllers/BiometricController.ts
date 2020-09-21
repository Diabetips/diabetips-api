/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Mar 14 2020
*/

import { Body, Get, JsonController, Param, Put } from "routing-controllers";

import { Authorized } from "../lib";
import { BiometricUpdateReq} from "../requests";
import { BiometricService } from "../services";

@JsonController("/v1/users/:uid/biometrics")
export class BiometricController {

    @Get("/")
    @Authorized("biometrics:read")
    public async getUserBiometric(@Param("uid") uid: string) {
        return BiometricService.getUserBiometric(uid);
    }

    @Put("/")
    @Authorized("biometrics:write")
    public async updateUserBiometric(@Param("uid") uid: string, @Body() body: BiometricUpdateReq) {
        return BiometricService.updateUserBiometric(uid, body);
    }
}
