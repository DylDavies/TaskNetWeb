import UserType from "@/app/enums/UserType.enum";
import AuthService from "@/app/services/AuthService";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";


// This function will take in a router and redirect the user to the secondary login page if they haven't already picked a usertype
async function LoginRedirect(router: AppRouterInstance) {
    const activeUser = await AuthService.getCurrentUser();

    if(activeUser){
        const userType = activeUser.userData.type;
        if(userType == UserType.None){
            //redirect to the secondary login page
              router.push('/signup');
              
        }
        else{
            Login(userType, router);
        }
      
  } 
    else {
    console.log("No active user");
  }
}

    // This function will take in a user type and a router and redirect the user to the appropriate page
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
              console.log("Client");
              router.push('/client');
              break;
            case 3:
              console.log("Admin");
              router.push('/admin');
              break;
            default:
              console.log("Number not in usertype");
              break;
          }

}
export {Login, LoginRedirect}

