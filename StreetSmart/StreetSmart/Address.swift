//
//  Address
//  StreetSmart
//
//  Created by aheifetz on 8/2/14.
//  Copyright (c) 2014 aheifetz. All rights reserved.
//

import UIKit

class Address: UIViewController, UITextFieldDelegate  {
    
    @IBOutlet weak var addressTextField: UITextField!
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        addressTextField.delegate = self
    }
    
    override func viewDidAppear(animated: Bool) {

    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    @IBAction func Submit(sender: AnyObject) {
        let prefs = NSUserDefaults.standardUserDefaults()
        let username:String? = prefs.stringForKey("currentUser")
        if let user = username {
            var dataRef = Firebase(
                url:"https://streetsmartdb.firebaseio.com/Users/\(user)/address"
            )
            dataRef.setValue(self.addressTextField.text)
            dataRef = Firebase(
                url:"https://streetsmartdb.firebaseio.com/Users/\(user)/using_address"
            )
            dataRef.setValue(true)
        }
        self.dismissViewControllerAnimated(true, completion: nil)
    }
    
    func textFieldShouldReturn(textField: UITextField!) -> Bool {   //delegate method
        textField.resignFirstResponder()
        return true
    }
}

