//
//  MapVC.swift
//  StreetSmart
//
//  Created by aheifetz on 8/3/14.
//  Copyright (c) 2014 aheifetz. All rights reserved.
//

import UIKit

class MapVC: UIViewController, GMSMapViewDelegate {

    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }
    
    override func viewDidAppear(animated: Bool) {
        //do nothing
        let prefs = NSUserDefaults.standardUserDefaults()
        let username:String? = prefs.stringForKey("currentUser")
        var gmaps:GMSMapView?
        var marker:GMSMarker?
        func showMap(coords: String, user: String) {
            var coordsArray = coords.componentsSeparatedByString(" ")
            var lon = NSString(string: coordsArray[0]).doubleValue
            var lat = NSString(string: coordsArray[1]).doubleValue
            println(lon)
            println(lat)
            var target: CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: lat, longitude: lon)
            var camera: GMSCameraPosition = GMSCameraPosition(target: target, zoom: 15, bearing: 0, viewingAngle: 0)
            if gmaps {
                let map = gmaps!
                var target: CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: lat, longitude: lon)
                marker!.position = CLLocationCoordinate2DMake(lat, lon)
                map.animateToLocation(target)
            }
            else {
                var target: CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: lat, longitude: lon)
                var camera: GMSCameraPosition = GMSCameraPosition(target: target, zoom: 15, bearing: 0, viewingAngle: 0)
                gmaps = GMSMapView(frame: CGRectMake(0, 66, self.view.bounds.width, self.view.bounds.height)) as GMSMapView!
                let map = gmaps!
                map.myLocationEnabled = true
                map.camera = camera
                map.delegate = self
                self.view.addSubview(map)
                marker = GMSMarker()
                marker!.position = CLLocationCoordinate2DMake(lat, lon);
                marker!.title = user;
                marker!.map = map
            }
        }
        func watchUser(user: String) {
            var dataRef = Firebase(
                url:"https://streetsmartdb.firebaseio.com/Users/\(user)"
            )
            dataRef.observeEventType(FEventTypeValue, withBlock: { snapshot in
                println(snapshot.value)
                var storedCoords:String? = snapshot.value.objectForKey("lastCoordinates") as String?
                if let coords:String = storedCoords {
                    showMap(coords, user)
                }
            })
        }
        if let user = username {
            var dataRef = Firebase(
                url:"https://streetsmartdb.firebaseio.com/Users/\(user)"
            )
            dataRef.observeSingleEventOfType(FEventTypeValue, withBlock: { snapshot in
                var storedFollowing:NSArray? = snapshot.value.objectForKey("following") as NSArray?
                if let following:NSArray = storedFollowing {
                    watchUser(following[0] as String)
                }
                
            })
        }
    }
    
    @IBAction func goBack(sender: AnyObject) {
        self.dismissViewControllerAnimated(true, completion: nil)
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
}