//
//  HomeVC.swift
//  StreetSmart
//
//  Created by aheifetz on 8/2/14.
//  Copyright (c) 2014 aheifetz. All rights reserved.
//

import UIKit

class HomeVC: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        NSUserDefaults.resetStandardUserDefaults()
        // Do any additional setup after loading the view, typically from a nib.
    }
    
    override func viewDidAppear(animated: Bool) {
        let prefs = NSUserDefaults.standardUserDefaults()
        let isLoggedIn:Int = prefs.integerForKey("loginStatus")
        println(prefs.stringForKey("currentUser"))
        if (isLoggedIn != 1) {
            self.performSegueWithIdentifier("goto_login", sender: self)
        }
    }
    
    @IBAction func logout(sender: AnyObject) {
        var prefs = NSUserDefaults.standardUserDefaults()
        prefs.removeObjectForKey("currentUser")
        prefs.setObject(1, forKey: "loginStatus")
        prefs.synchronize()
        
        self.performSegueWithIdentifier("goto_login", sender: self)
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}

