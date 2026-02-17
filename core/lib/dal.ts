import 'server-only';
import { cookies } from 'next/headers';
import { readMe } from '@directus/sdk';
import { redirect } from 'next/navigation';
import { directus } from './directus';
import { IUser } from '../interfaces/user.interface';


interface UserDataResponse { success: boolean; user: IUser, needs_password_change?: boolean }
export async function getUserData(formLogin?: boolean): Promise<UserDataResponse> {
    try {

        const token = (await cookies()).get("directus_session_token")?.value;

        if (!token) {
            redirect("/auth/login");
        }

        directus.setToken(token)
        const user: any = await directus.request(readMe({
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

