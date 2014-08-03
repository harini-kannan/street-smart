//
//  LoginVC.swift
//  StreetSmart
//
//  Created by aheifetz on 8/2/14.
//  Copyright (c) 2014 aheifetz. All rights reserved.
//

import UIKit

class LoginVC: UIViewController {
    
    @IBOutlet weak var username: UITextField!
    @IBOutlet weak var password: UITextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    @IBAction func loginTapped(sender: UIButton) {
        var prefs = NSUserDefaults.standardUserDefaults()
        var dataRef = Firebase(
            url:"https://streetsmartdb.firebaseio.com/Users/\(username.text)"
        )
        dataRef.observeSingleEventOfType(
            FEventTypeValue,
            withBlock: { snapshot in
                if snapshot.value is NSNull {
                    var alertView:UIAlertView = UIAlertView()
                    alertView.title = "Sign in Failed!"
                    alertView.message = "Username does not exist"
                    alertView.delegate = self
                    alertView.addButtonWithTitle("OK")
                    alertView.show()
                }
                else {
                    var storedPass = snapshot.value.objectForKey("password") as? String
                    if let pass = storedPass {
                        if pass == self.password.text {
                            prefs.setObject(self.username.text, forKey: "currentUser")
                            prefs.setInteger(1, forKey: "loginStatus")
                            prefs.synchronize()
                            self.dismissViewControllerAnimated(true, completion: nil)
                        }
                        else {
                            var alertView:UIAlertView = UIAlertView()
                            alertView.title = "Sign in Failed!"
                            alertView.message = "Password incorrect"
                            alertView.delegate = self
                            alertView.addButtonWithTitle("OK")
                            alertView.show()
                        }
                    }
                    else {
                        var alertView:UIAlertView = UIAlertView()
                        alertView.title = "Sign in Failed!"
                        alertView.message = "Something really weird happened"
                        alertView.delegate = self
                        alertView.addButtonWithTitle("OK")
                        alertView.show()
                    }
                }
            }
        )
    }
    @IBAction func signupTapped(sender: UIButton) {
        println("Signup tapped")
        var dataRef = Firebase(
            url:"https://streetsmartdb.firebaseio.com/Users/\(username.text)"
        )
        dataRef.observeSingleEventOfType(
            FEventTypeValue,
            withBlock: { snapshot in
                if snapshot.value is NSNull {
                    dataRef.setValue([
                        "username": self.username.text,
                        "password": self.password.text
                    ])
                    var prefs = NSUserDefaults.standardUserDefaults()
                    prefs.setObject(self.username.text, forKey: "currentUser")
                    prefs.setObject(1, forKey: "loginStatus")
                    prefs.synchronize()
                    self.dismissViewControllerAnimated(true, completion: nil)
                }
                else {
                    var alertView:UIAlertView = UIAlertView()
                    alertView.title = "Signup Failed!"
                    alertView.message = "Username already exists"
                    alertView.delegate = self
                    alertView.addButtonWithTitle("OK")
                    alertView.show()
                }
            }
        )
    }
    
    
}