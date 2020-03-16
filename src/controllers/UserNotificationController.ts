/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Mar 15 2020
*/

import { Delete, Get, JsonController, Param } from "routing-controllers";

@JsonController("/v1/users/:uid/notifications")
export class UserNotificationController {

    @Get("/")
    public async getAllNotifications(@Param("uid") uid: string) {
        return [
            {
                id: "01234567-89ab-cdef-0123-456789abcdef",
                time: "2020-03-14T01:23:45Z",
                read: false,
                type: "user-invite",
                data: {
                    from: "01234567-89ab-cdef-0123-456789abcdef",
                },
            },
        ];
    }

    @Delete("/:id")
    public async markNotificationsRead(@Param("uid") uid: string, @Param("id") notifId: string) {
        return;
    }

}
