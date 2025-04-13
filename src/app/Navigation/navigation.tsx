import UserType from "@/app/enums/UserType.enum";
import AuthService from "@/app/services/AuthService";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

async function LoginRedirect(router: AppRouterInstance) {
    const activeUser = await AuthService.getCurrentUser();

    if(activeUser){
        const userType = activeUser.userData.type;
        if(userType == UserType.None){
            //ToDo
            //redirect to the secondary login page
        }
        else{
            Login(userType, router);
        }
    }
    else{
        console.log("No active user");
    }
    
}

    function Login(type: UserType, router: AppRouterInstance){
        switch (type) {
            case 0:
              console.log("none");
              LoginRedirect(router);
              break;
            case 1:
              console.log("Freelancer");
              router.push('/freelancer');
              break;
            case 2:
              console.log("");
              break;
            case 3:
              console.log("You picked three!");
              break;
            default:
              console.log("Number is out of range (0-3).");
              break;
          }

}