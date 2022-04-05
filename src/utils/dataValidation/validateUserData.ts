class UserData {
    id?: string;
    name?: string;
    photoURL?: string;
}

export function validateUserData(data: any): boolean {
    const properties = Object.getOwnPropertyNames(UserData.prototype);
    for (let i = 0; i < properties.length; i++) {
        if (!data[properties[i]]) return false;
    }

    if (typeof data.id !== 'string') return false;
    if (typeof data.name !== 'string') return false;
    if (typeof data.photoURL !== 'string') return false;

    return true;
}
