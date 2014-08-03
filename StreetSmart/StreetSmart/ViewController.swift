//
//  ViewController.swift
//  StreetSmart
//
//  Created by aheifetz on 8/2/14.
//  Copyright (c) 2014 aheifetz. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
                            
    @IBOutlet weak var theTextfieldUsername: UITextField!
    
    @IBOutlet weak var theTextfieldPassword: UITextField!
    
    @IBOutlet weak var theLabel: UILabel!
    
    
    @IBAction func theVerifyMethod(sender: AnyObject) {
        var usr = "car"
        var pw = "black"
        
        if theTextfieldUsername.text == usr &&
            theTextfieldPassword.text == pw
        {
            theLabel.text = "Correct"
            theTextfieldUsername.resignFirstResponder()
            theTextfieldPassword.resignFirstResponder()
        }
        else {
            theLabel.text = "Fail"
            theTextfieldUsername.resignFirstResponder()
            theTextfieldPassword.resignFirstResponder()
        }
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

