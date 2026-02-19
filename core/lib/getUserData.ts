import { readMe } from '@directus/sdk';
import { redirect } from 'next/navigation';
import 'server-only';
import { IUser } from '../interfaces/user.interface';
import { getAccessToken } from './auth';
import { getDirectusClient } from './directus';


interface UserDataResponse { success: boolean; user: IUser, needs_password_change?: boolean }

export async function getUserData(formLogin?: boolean): Promise<UserDataResponse> {
    try {

        const token = await getAccessToken();
        const client = getDirectusClient(token!);

        const user: any = await client.request(readMe({
            fields: [
                "*",
                "office_id.*" as any,
                "office_id.district_id.*" as any,
                "office_id.district_id.province_id.*" as any,
                "role.*"
            ]
        }));


        const response: UserDataResponse = {
            success: true,
            user: user
        }
        if (user.needs_password_change) {
            response.needs_password_change = true
        }

        return response;
    } catch (error) {
        redirect("/auth/login");
    }
}
