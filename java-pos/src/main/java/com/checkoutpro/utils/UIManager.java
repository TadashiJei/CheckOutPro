package com.checkoutpro.utils;

import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;
import javax.imageio.ImageIO;

/**
 * Utility class for UI-related operations.
 * Provides methods for image loading, scaling, and UI customization.
 */
public class UIManager {
    
    // Application color scheme
    public static final Color PRIMARY_COLOR = new Color(0, 123, 255);
    public static final Color SECONDARY_COLOR = new Color(108, 117, 125);
    public static final Color SUCCESS_COLOR = new Color(40, 167, 69);
    public static final Color DANGER_COLOR = new Color(220, 53, 69);
    public static final Color WARNING_COLOR = new Color(255, 193, 7);
    public static final Color INFO_COLOR = new Color(23, 162, 184);
    public static final Color LIGHT_COLOR = new Color(248, 249, 250);
    public static final Color DARK_COLOR = new Color(52, 58, 64);
    
    // Font sizes
    public static final int FONT_SIZE_SMALL = 12;
    public static final int FONT_SIZE_MEDIUM = 14;
    public static final int FONT_SIZE_LARGE = 18;
    public static final int FONT_SIZE_XLARGE = 24;
    
    // Default font
    public static final Font DEFAULT_FONT = new Font("Arial", Font.PLAIN, FONT_SIZE_MEDIUM);
    public static final Font BOLD_FONT = new Font("Arial", Font.BOLD, FONT_SIZE_MEDIUM);
    
    /**
     * Sets the look and feel of the application.
     * 
     * @param lookAndFeel The class name of the look and feel to use
     * @throws ClassNotFoundException If the look and feel class cannot be found
     * @throws InstantiationException If the look and feel cannot be instantiated
     * @throws IllegalAccessException If the look and feel cannot be accessed
     * @throws UnsupportedLookAndFeelException If the look and feel is not supported
     */
    public static void setLookAndFeel(String lookAndFeel) throws ClassNotFoundException,
            InstantiationException, IllegalAccessException, UnsupportedLookAndFeelException {
        javax.swing.UIManager.setLookAndFeel(lookAndFeel);
    }
    
    /**
     * Loads an image from a URL.
     * 
     * @param imageUrl The URL of the image to load
     * @return The loaded image, or null if loading fails
     */
    public static BufferedImage loadImage(String imageUrl) {
        try {
            URL url = new URL(imageUrl);
            return ImageIO.read(url);
        } catch (IOException e) {
            System.err.println("Failed to load image from URL: " + imageUrl);
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * Scales an image to the specified width and height.
     * 
     * @param image The image to scale
     * @param width The target width
     * @param height The target height
     * @return The scaled image
     */
    public static BufferedImage scaleImage(BufferedImage image, int width, int height) {
        if (image == null) {
            return null;
        }
        
        BufferedImage scaledImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = scaledImage.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.drawImage(image, 0, 0, width, height, null);
        g2d.dispose();
        
        return scaledImage;
    }
    
    /**
     * Creates a styled button with the specified text and color.
     * 
     * @param text The button text
     * @param color The button background color
     * @return The styled button
     */
    public static JButton createStyledButton(String text, Color color) {
        JButton button = new JButton(text);
        button.setBackground(color);
        button.setForeground(Color.WHITE);
        button.setFocusPainted(false);
        button.setFont(BOLD_FONT);
        button.setBorderPainted(false);
        button.setOpaque(true);
        
        return button;
    }
    
    /**
     * Creates a styled label with the specified text and font.
     * 
     * @param text The label text
     * @param font The label font
     * @return The styled label
     */
    public static JLabel createStyledLabel(String text, Font font) {
        JLabel label = new JLabel(text);
        label.setFont(font);
        return label;
    }
    
    /**
     * Creates a styled panel with the specified background color.
     * 
     * @param color The panel background color
     * @return The styled panel
     */
    public static JPanel createStyledPanel(Color color) {
        JPanel panel = new JPanel();
        panel.setBackground(color);
        return panel;
    }
    
    /**
     * Centers a component on the screen.
     * 
     * @param component The component to center
     */
    public static void centerOnScreen(Component component) {
        Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
        Dimension componentSize = component.getSize();
        
        int x = (screenSize.width - componentSize.width) / 2;
        int y = (screenSize.height - componentSize.height) / 2;
        
        component.setLocation(x, y);
    }
}
