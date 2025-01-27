//
//  PaletteFrameProcessorPlugin.swift
//  Colorwaver
//
//  Created by Marc Rousavy on 28.08.21.
//

// import Foundation
// import UIImageColors

// @objc(PaletteFrameProcessorPlugin)
// public class PaletteFrameProcessorPlugin: NSObject, FrameProcessorPluginBase {
//   private static let context = CIContext(options: nil)
  
//   private static func convertQuality(quality: String) -> UIImageColorsQuality {
//     switch (quality) {
//     case "lowest":
//       return .lowest
//     case "low":
//       return .low
//     case "high":
//       return .high
//     case "highest":
//       fallthrough
//     default:
//       return .highest
//     }
//   }
  
//   @objc
//   public static func callback(_ frame: Frame!, withArgs args: [Any]!) -> Any! {
//     guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
//       print("Failed to get CVPixelBuffer!")
//       return nil
//     }
//     let ciImage = CIImage(cvPixelBuffer: imageBuffer)

//     guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else {
//       print("Failed to create CGImage!")
//       return nil
//     }
//     let image = UIImage(cgImage: cgImage)
    
//     var quality: UIImageColorsQuality = .highest
    
//     if !args.isEmpty {
//       if let qualityString = args[0] as? NSString {
//         quality = convertQuality(quality: qualityString as String)
//       }
//     }
    
//     guard let colors = image.getColors(quality: quality) else {
//       print("Failed to get Image Color Palette!")
//       return nil
//     }
    
//     return [
//       "primary": colors.primary.hexString,
//       "secondary": colors.secondary.hexString,
//       "background": colors.background.hexString,
//       "detail": colors.detail.hexString
//     ]
//   }
// }

//
//  PaletteFrameProcessorPlugin.swift
//  Colorwaver
//
//  Created by Marc Rousavy on 28.08.21.
//

import UIKit
import UIImageColors

@objc(PaletteFrameProcessorPlugin)
public class PaletteFrameProcessorPlugin: NSObject, FrameProcessorPluginBase {
    private static let context = CIContext(options: nil)

    @objc
    public static func callback(_ frame: Frame!, withArgs args: [Any]!) -> Any! {
        guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
            print("Failed to get CVPixelBuffer!")
            return nil
        }

        let ciImage = CIImage(cvPixelBuffer: imageBuffer)

        guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else {
            print("Failed to create CGImage!")
            return nil
        }

        let image = UIImage(cgImage: cgImage)

        // Extract the colors using UIImageColors
        guard let colors = image.getColors(quality: .high) else {
            print("Failed to extract colors!")
            return nil
        }

        // Calculate total pixels
        let totalPixels = cgImage.width * cgImage.height

        // Initialize color counts
        var primaryCount = 0
        var secondaryCount = 0
        var backgroundCount = 0
        var detailCount = 0

        // Process pixel data
        if let pixelData = cgImage.dataProvider?.data {
            let data = CFDataGetBytePtr(pixelData)
            let bytesPerRow = cgImage.bytesPerRow
            let bytesPerPixel = 4

            for y in 0..<cgImage.height {
                for x in 0..<cgImage.width {
                    let pixelIndex = y * bytesPerRow + x * bytesPerPixel

                    let red = CGFloat(data![pixelIndex]) / 255.0
                    let green = CGFloat(data![pixelIndex + 1]) / 255.0
                    let blue = CGFloat(data![pixelIndex + 2]) / 255.0

                    let color = UIColor(red: red, green: green, blue: blue, alpha: 1.0)

                    // Compare pixel color with palette colors
                    if color.isSimilar(to: colors.primary) {
                        primaryCount += 1
                    } else if color.isSimilar(to: colors.secondary) {
                        secondaryCount += 1
                    } else if color.isSimilar(to: colors.background) {
                        backgroundCount += 1
                    } else if color.isSimilar(to: colors.detail) {
                        detailCount += 1
                    }
                }
            }
        }

        // Debugging logs
        print("---- Native Output ----")
        print("Primary Count: \(primaryCount)")
        print("Secondary Count: \(secondaryCount)")
        print("Background Count: \(backgroundCount)")
        print("Detail Count: \(detailCount)")
        print("Total Pixels: \(totalPixels)")

        // Return the palette with counts
        return [
            "primary": ["color": colors.primary.hexString, "count": primaryCount],
            "secondary": ["color": colors.secondary.hexString, "count": secondaryCount],
            "background": ["color": colors.background.hexString, "count": backgroundCount],
            "detail": ["color": colors.detail.hexString, "count": detailCount],
            "totalPixels": totalPixels
        ]
    }
}

import UIKit

extension UIColor {
    func isSimilar(to color: UIColor, tolerance: CGFloat = 0.1) -> Bool {
        var r1: CGFloat = 0, g1: CGFloat = 0, b1: CGFloat = 0, a1: CGFloat = 0
        var r2: CGFloat = 0, g2: CGFloat = 0, b2: CGFloat = 0, a2: CGFloat = 0

        // Extract RGBA components from both colors
        self.getRed(&r1, green: &g1, blue: &b1, alpha: &a1)
        color.getRed(&r2, green: &g2, blue: &b2, alpha: &a2)

        // Calculate the Euclidean distance between the two colors
        let distance = sqrt(pow(r1 - r2, 2) + pow(g1 - g2, 2) + pow(b1 - b2, 2))

        // Check if the distance is within the tolerance
        return distance <= tolerance
    }
}
