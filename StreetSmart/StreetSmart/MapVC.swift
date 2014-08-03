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
    
    func watchUser(user: String) {
        var dataRef = Firebase(
            url:"https://streetsmartdb.firebaseio.com/Users/\(user)"
        )
        dataRef.observeEventType(FEventTypeValue, withBlock: { snapshot in
            println(snapshot.value)
            var storedCoords:String? = snapshot.value.objectForKey("lastCoordinates") as String?
            if let coords:String = storedCoords {
                self.showMap(coords, user: user)
            }
        })
    }
    
    func showMap(coords: String, user: String) {
        var coordsArray = coords.componentsSeparatedByString(" ")
        var lon = NSString(string: coordsArray[0]).doubleValue
        var lat = NSString(string: coordsArray[1]).doubleValue
        println(lon)
        println(lat)
        var target: CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: lat, longitude: lon)
        var camera: GMSCameraPosition = GMSCameraPosition(target: target, zoom: 15, bearing: 0, viewingAngle: 0)
        var gmaps:GMSMapView? = GMSMapView(frame: CGRectMake(0, 0, self.view.bounds.width, self.view.bounds.height))
        if let map = gmaps? {
            map.myLocationEnabled = true
            map.camera = camera
            map.delegate = self
            self.view.addSubview(gmaps)
            var marker:GMSMarker = GMSMarker()
            marker.position = CLLocationCoordinate2DMake(lat, lon);
            marker.title = user;
            marker.map = map
        }
    }
    
    override func viewDidAppear(animated: Bool) {
        //do nothing
        let prefs = NSUserDefaults.standardUserDefaults()
        let username:String? = prefs.stringForKey("currentUser")
        if let user = username {
            var dataRef = Firebase(
                url:"https://streetsmartdb.firebaseio.com/Users/\(user)"
            )
            dataRef.observeSingleEventOfType(FEventTypeValue, withBlock: { snapshot in
                var storedFollowing:NSArray? = snapshot.value.objectForKey("following") as NSArray?
                if let following:NSArray = storedFollowing {
                    self.watchUser(following[0] as String)
                }

            })
        }

    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
}