//
//  LocationVC.swift
//  StreetSmart
//
//  Created by aheifetz on 8/2/14.
//  Copyright (c) 2014 aheifetz. All rights reserved.
//

import UIKit
import CoreLocation

class LocationVC: UIViewController, CLLocationManagerDelegate {
    @IBOutlet weak var statusLabel: UILabel!
    var locationManager = CLLocationManager()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }
    
    override func viewDidAppear(animated: Bool) {
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        //locationManager.pausesLocationUpdatesAutomatically = true
        locationManager.startUpdatingLocation()
        locationManager.delegate = self
        println("Rendered")
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func goHome(sender: AnyObject) {
        
        locationManager.stopUpdatingLocation()
        self.dismissViewControllerAnimated(true, completion: nil)
    }
    
    func locationManager(manager: CLLocationManager!, didUpdateLocations locations: [AnyObject]!) {
        let locationArray = locations as NSArray
        let locationObj = locationArray.lastObject as CLLocation
        let coord = locationObj.coordinate
        let lat = "\(coord.latitude)"
        let lon = "\(coord.longitude)"
        let speed = "\(locationObj.speed)"
        let coordString = lat + " " + lon
        let prefs = NSUserDefaults.standardUserDefaults()
        let username:String? = prefs.stringForKey("currentUser")
        if let user = username {
            var dataRef = Firebase(
                url:"https://streetsmartdb.firebaseio.com/Users/\(user)/lastCoordinates"
            )
            dataRef.setValue(coordString)
            dataRef = Firebase(
                url:"https://streetsmartdb.firebaseio.com/Users/\(user)/speed"
            )
            dataRef.setValue(speed)
            dataRef = Firebase(
                url:"https://streetsmartdb.firebaseio.com/Users/\(user)/using_address"
            )
            dataRef.setValue(false)
            dataRef = Firebase(
                url:"https://streetsmartdb.firebaseio.com/Users/\(user)/inDanger"
            )
            dataRef.observeEventType(
                FEventTypeValue,
                withBlock: { snapshot in
                    if snapshot.value is NSNull {
                        return
                    }
                    else {
                        println(snapshot.value)
                        let value = snapshot.value as Bool
                        if(value) {
                            self.statusLabel.text = "Status: At Risk!"
                        }
                        else {
                            self.statusLabel.text = "Status: Safe!"
                        }
                        
                    }

            })
        }
    }
}