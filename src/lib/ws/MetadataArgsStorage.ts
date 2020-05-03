/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Apr 30 2020
*/

import { MetadataArgsStorage } from ".";

export function getMetadataArgsStorage(): MetadataArgsStorage {
    if (!(global as any).webSocketMetadataArgsStorage)
        (global as any).webSocketMetadataArgsStorage = new MetadataArgsStorage();
    return (global as any).webSocketMetadataArgsStorage;
}
