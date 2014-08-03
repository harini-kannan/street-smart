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
        println("Login tapped")
        var prefs = NSUserDefaults.standardUserDefaults()
        var usr:String? = prefs.stringForKey("defaultUser")
        var pwd:String? = prefs.stringForKey("defaultPassword")
        if usr && pwd
        {
            usr = usr!
            pwd = pwd!
            if username.text == usr && password.text == pwd {
                prefs.setObject(username.text, forKey: "currentUser")
                prefs.setInteger(1, forKey: "loginStatus")
                prefs.synchronize()
                
                self.dismissViewControllerAnimated(true, completion: nil)
            }
            else {
                var alertView:UIAlertView = UIAlertView()
                alertView.title = "Sign in Failed!"
                alertView.message = "Wrong username or password"
                alertView.delegate = self
                alertView.addButtonWithTitle("OK")
                alertView.show()
            }
        }
        else {
            var alertView:UIAlertView = UIAlertView()
            alertView.title = "Sign in Failed!"
            alertView.message = "Please create an account"
            alertView.delegate = self
            alertView.addButtonWithTitle("OK")
            alertView.show()
        }
    }
    @IBAction func signupTapped(sender: UIButton) {
        println("Signup tapped")
        var prefs = NSUserDefaults.standardUserDefaults()
        prefs.setObject(username.text, forKey: "defaultUser")
        prefs.setObject(username.text, forKey: "currentUser")
        prefs.setObject(password.text, forKey: "defaultPassword")
        prefs.setObject(1, forKey: "loginStatus")
        prefs.synchronize()
        self.dismissViewControllerAnimated(true, completion: nil)

    }
    
    
}