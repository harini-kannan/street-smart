//
//  MapVC.swift
//  StreetSmart
//
//  Created by aheifetz on 8/3/14.
//  Copyright (c) 2014 aheifetz. All rights reserved.
//

import UIKit
import CoreLocation

class MapVC: UIViewController, GMSMapViewDelegate {
    
    var gmaps:GMSMapView?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        var target: CLLocationCoordinate2D = CLLocationCoordinate2D(latitude: 51.6, longitude: 17.2)
        var camera: GMSCameraPosition = GMSCameraPosition(target: target, zoom: 6, bearing: 0, viewingAngle: 0)
        
        gmaps = GMSMapView(frame: CGRectMake(0, 0, self.view.bounds.width, self.view.bounds.height - super.tabBarController.tabBar.bounds.height))
        if let map = gmaps? {
            map.myLocationEnabled = true
            map.camera = camera
            map.delegate = self
            
            self.view.addSubview(gmaps)
        }
    }
    
    override func viewDidAppear(animated: Bool) {
        //do nothing
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
}