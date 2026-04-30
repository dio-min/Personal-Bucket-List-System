import { Link } from "react-router-dom";
import Logout from "../Logout";
import {Button, Modal} from "@heroui/react";


import { useNavigate } from "react-router-dom";


function Navigate() {
 const navigate = useNavigate();



  


  return (
    <div className="sticky top-0 z-50 bg-black border-b border-white/20 backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-5">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <img src="/logos1.png" alt="Logo" style={{width: "50px"}}/>
          <h1 className="text-2xl font-bold text-white">HeyBuck</h1>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8 text-sm">
          <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
            Home
          </Link>

          
          
          <Link to="/album" className="text-gray-300 hover:text-white transition-colors">
            Album
          </Link>
          <Link to="/viewlist" className="text-gray-300 hover:text-white transition-colors">
            View List
          </Link>

          <Modal>
      <Button variant="primary">Log Out</Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[360px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              
              <Modal.Heading>Confirm Logout</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>
                Are you sure you want to log out? You will need to log in again to access your bucket list.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Logout />
              <Button variant="ghost" slot="close">
                Cancel
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
          
        </div>

        {/* Right side (optional - you can add user avatar/logout later) */}
        
      </div>
    </div>
  );
}

export default Navigate;