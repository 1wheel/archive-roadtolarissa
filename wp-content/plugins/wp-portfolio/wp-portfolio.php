<?php
/**
 * Plugin Name: Wordpress Portfolio Plugin
 * Plugin URI: http://wordpress.org/extend/plugins/wp-portfolio/
 * Description: A plugin that allows you to show off your portfolio through a single page on your wordpress blog with automatically generated thumbnails. To show your portfolio, create a new page and paste [wp-portfolio] into it. The plugin requires you to have a free account with <a href="http://www.shrinktheweb.com/">Shrink The Web</a> to generate the thumbnails.
 * Version: 1.35
 * Author: Dan Harrison
 * Author URI: http://www.wpdoctors.co.uk 
 
 * This plugin is licensed under the Apache 2 License
 * http://www.apache.org/licenses/LICENSE-2.0
 */


// Admin Only
if (is_admin()) 
{
	include_once('wplib/utils_pagebuilder.inc.php');
	include_once('wplib/utils_formbuilder.inc.php');
	include_once('wplib/utils_tablebuilder.inc.php');
		
	include_once('lib/admin_only.inc.php');
}

// Common 
include_once('wplib/utils_sql.inc.php');

// Common
include_once('lib/thumbnailer.inc.php');
include_once('lib/widget.inc.php');
include_once('lib/utils.inc.php');


/* Load translation files */
load_plugin_textdomain('wp-portfolio', false, basename( dirname( __FILE__ ) ) . '/languages' );


/** Constant: The current version of the database needed by this version of the plugin.  */
define('WPP_VERSION', 							'1.35');



/** Constant: The string used to determine when to render a group name. */
define('WPP_STR_GROUP_NAME', 					'%GROUP_NAME%');

/** Constant: The string used to determine when to render a group description. */
define('WPP_STR_GROUP_DESCRIPTION', 	 		'%GROUP_DESCRIPTION%');

/** Constant: The string used to determine when to render a website name. */
define('WPP_STR_WEBSITE_NAME', 	 				'%WEBSITE_NAME%');

/** Constant: The string used to determine when to render a website thumbnail image. */
define('WPP_STR_WEBSITE_THUMBNAIL', 	 		'%WEBSITE_THUMBNAIL%');

/** Constant: The string used to determine when to render a website thumbnail image URL. */
define('WPP_STR_WEBSITE_THUMBNAIL_URL', 	 	'%WEBSITE_THUMBNAIL_URL%');

/** Constant: The string used to determine when to render a website url. */
define('WPP_STR_WEBSITE_URL', 	 				'%WEBSITE_URL%');

/** Constant: The string used to determine when to render a website description. */
define('WPP_STR_WEBSITE_DESCRIPTION', 	 		'%WEBSITE_DESCRIPTION%');

/** Constant: The string used to determine when to render a custom field value. */
define('WPP_STR_WEBSITE_CUSTOM_FIELD', 	 		'%WEBSITE_CUSTOM_FIELD%');

/** Constant: Default HTML to render a group. */
define('WPP_DEFAULT_GROUP_TEMPLATE', 			
"<h2>%GROUP_NAME%</h2>
<p>%GROUP_DESCRIPTION%</p>");

/** Constant: Default HTML to render a website. */
define('WPP_DEFAULT_WEBSITE_TEMPLATE', 			
"<div class=\"portfolio-website\">
    <div class=\"website-thumbnail\"><a href=\"%WEBSITE_URL%\" target=\"_blank\">%WEBSITE_THUMBNAIL%</a></div>
    <div class=\"website-name\"><a href=\"%WEBSITE_URL%\" target=\"_blank\">%WEBSITE_NAME%</a></div>
    <div class=\"website-url\"><a href=\"%WEBSITE_URL%\" target=\"_blank\">%WEBSITE_URL%</a></div>
    <div class=\"website-description\">%WEBSITE_DESCRIPTION%</div>
    <div class=\"website-clear\"></div>
</div>");

/** Constant: Default HTML to render a website in the widget area. */
define('WPP_DEFAULT_WIDGET_TEMPLATE', 			
"<div class=\"widget-portfolio\">
    <div class=\"widget-website-thumbnail\">
    	<a href=\"%WEBSITE_URL%\" target=\"_blank\">%WEBSITE_THUMBNAIL%</a>
    </div>
    <div class=\"widget-website-name\">
    	<a href=\"%WEBSITE_URL%\" target=\"_blank\">%WEBSITE_NAME%</a>
    </div>
    <div class=\"widget-website-description\">
    	%WEBSITE_DESCRIPTION%
    </div>
    <div class=\"widget-website-clear\"></div>
</div>");

/** Constant: Default HTML to render the paging for the websites. */
define('WPP_DEFAULT_PAGING_TEMPLATE', '
<div class="portfolio-paging">
	<div class="page-count">Showing page %PAGING_PAGE_CURRENT% of %PAGING_PAGE_TOTAL%</div>
	%LINK_PREVIOUS% %PAGE_NUMBERS% %LINK_NEXT%
</div>
');


define('WPP_DEFAULT_PAGING_TEMPLATE_PREVIOUS', 	__('Previous', 'wp-portfolio'));
define('WPP_DEFAULT_PAGING_TEMPLATE_NEXT', 		__('Next', 'wp-portfolio'));

/** Constant: Default CSS to style the portfolio. */
define('WPP_DEFAULT_CSS',"
.portfolio-website {
	padding: 10px;
	margin-bottom: 10px;
}
.website-thumbnail {
	float: left;
	margin: 0 20px 20px 0;
}
.website-thumbnail img {
	border: 1px solid #555;
	margin: 0;
	padding: 0;
}
.website-name {
	font-size: 12pt;
	font-weight: bold;
	margin-bottom: 3px;
}
.website-name a,.website-url a {
	text-decoration: none;
}
.website-name a:hover,.website-url a:hover {
	text-decoration: underline;
}
.website-url {
	font-size: 9pt;
	font-weight: bold;
}
.website-url a {
	color: #777;
}
.website-description {
	margin-top: 15px;
}
.website-clear {
	clear: both;
}");

/** Constant: Default CSS to style the paging feature. */
define('WPP_DEFAULT_CSS_PAGING',"
.portfolio-paging {
	text-align: center;
	padding: 4px 10px 4px 10px;
	margin: 0 10px 20px 10px;
}
.portfolio-paging .page-count {
	margin-bottom: 5px;
}
.portfolio-paging .page-jump b {
	padding: 5px;
}
.portfolio-paging .page-jump a {
	text-decoration: none;
}");


/** Constant: Default CSS to style the widget feature. */
define('WPP_DEFAULT_CSS_WIDGET',"
.wp-portfolio-widget-des {
	margin: 8px 0;
	font-size: 110%;
}
.widget-website {
	border: 1px solid #AAA;
	padding: 3px 10px;
	margin: 0 5px 10px;
}
.widget-website-name {
	font-size: 120%;
	font-weight: bold;
	margin-bottom: 5px;
}
.widget-website-description {
	line-height: 1.1em;
}
.widget-website-thumbnail {
	margin: 10px auto 6px auto;
	width: 102px;
}
.widget-website-thumbnail img {
	width: 100px;
	border: 1px solid #555;
	margin: 0;
	padding: 0;
}
.widget-website-clear {
	clear: both;
	height: 1px;
}");


/** Constant: The name of the table to store the website information. */
define('TABLE_WEBSITES', 						'WPPortfolio_websites');

/** Constant: The name of the table to store the website information. */
define('TABLE_WEBSITE_GROUPS', 					'WPPortfolio_groups');

/** Constant: The name of the table to store the debug information. */
define('TABLE_WEBSITE_DEBUG', 					'WPPortfolio_debuglog');

/** Contstant: The path to use to store the cached thumbnails. */
define('WPP_THUMBNAIL_PATH',					'wp-portfolio/cache');

/** Contstant: The name of the setting with the cache setting. */
define('WPP_CACHE_SETTING', 					'WPPortfolio_cache_location');

/** Contstant: The name of the setting with the thumbnail refresh time. */
define('WPP_STW_REFRESH_TIME', 					'WPPortfolio_thumbnail_refresh_time');


/** Contstant: The path to use to store the cached thumbnails. */
define('WPP_THUMB_DEFAULTS',					'wp-portfolio/imgs/thumbnail_');

/** Constant: URL location for settings page. */
define('WPP_SETTINGS', 							'admin.php?page=WPP_show_settings');

/** Constant: URL location for settings page. */
define('WPP_DOCUMENTATION', 					'admin.php?page=WPP_show_documentation');

/** Constant: URL location for website summary. */
define('WPP_WEBSITE_SUMMARY', 					'admin.php?page=wp-portfolio/wp-portfolio.php');

/** Constant: URL location for modifying a website entry. */
define('WPP_MODIFY_WEBSITE', 					'admin.php?page=WPP_modify_website');

/** Constant: URL location for showing the list of groups in the portfolio. */
define('WPP_GROUP_SUMMARY', 					'admin.php?page=WPP_website_groups');

/** Constant: URL location for modifying a group entry. */
define('WPP_MODIFY_GROUP', 						'admin.php?page=WPP_modify_group');



/**
 * Function: WPPortfolio_menu()
 *
 * Creates the menu with all of the configuration settings.
 */

function WPPortfolio_menu()
{
	add_menu_page('WP Portfolio - Summary of Websites in your Portfolio', 'WP Portfolio', 'manage_options', __FILE__, 'WPPortfolio_show_websites');
	
	add_submenu_page(__FILE__, 'WP Portfolio - '.__('Modify Website', 'wp-portfolio'), 		'Add New Website', 		'manage_options', 'WPP_modify_website', 'WPPortfolio_modify_website');
	add_submenu_page(__FILE__, 'WP Portfolio - '.__('Modify Group', 'wp-portfolio'), 		'Add New Group', 		'manage_options', 'WPP_modify_group', 'WPPortfolio_modify_group');
	add_submenu_page(__FILE__, 'WP Portfolio - '.__('Groups', 'wp-portfolio'), 				'Website Groups', 		'manage_options', 'WPP_website_groups', 'WPPortfolio_show_website_groups');		
	
	// Spacer
	add_submenu_page(__FILE__, false, '<span class="wpp_menu_section" style="display: block; margin: 1px 0 1px -5px; padding: 0; height: 1px; line-height: 1px; background: #CCC;"></span>', 'manage_options', '#', false);	
	
	add_submenu_page(__FILE__, 'WP Portfolio - '.__('General Settings', 'wp-portfolio'), 	'Portfolio Settings', 	'manage_options', 'WPP_show_settings', 'WPPortfolio_pages_showSettings');
	add_submenu_page(__FILE__, 'WP Portfolio - '.__('Layout Settings', 'wp-portfolio'), 	'Layout Settings', 		'manage_options', 'WPP_show_layout_settings', 'WPPortfolio_pages_showLayoutSettings');
	
	// Spacer
	add_submenu_page(__FILE__, false, '<span class="wpp_menu_section" style="display: block; margin: 1px 0 1px -5px; padding: 0; height: 1px; line-height: 1px; background: #CCC;"></span>', 'manage_options', '#', false);
	
	add_submenu_page(__FILE__, 'WP Portfolio - '.__('Refresh Thumbnails', 'wp-portfolio'), 	__('Refresh Thumbnails', 'wp-portfolio'), 	'manage_options', 'WPP_show_refreshThumbnails', 'WPPortfolio_pages_showRefreshThumbnails');
	
	// Spacer
	add_submenu_page(__FILE__, false, '<span class="wpp_menu_section" style="display: block; margin: 1px 0 1px -5px; padding: 0; height: 1px; line-height: 1px; background: #CCC;"></span>', 'manage_options', '#', false);
	
	add_submenu_page(__FILE__, 'WP Portfolio - '.__('Documentation', 'wp-portfolio'), 		'Documentation', 		'manage_options', 'WPP_show_documentation', 'WPPortfolio_pages_showDocumentation');

	$errorCount = WPPortfolio_errors_getErrorCount();
	$errorCountMsg = false;
	if ($errorCount > 0) {
		$errorCountMsg = sprintf('<span title="%d Error" class="update-plugins"><span class="update-count">%d</span></span>', $errorCount, $errorCount);
	}
	
	add_submenu_page(__FILE__, 'WP Portfolio - '.__('Error Logs', 'wp-portfolio'), 		__('Error Logs', 'wp-portfolio').$errorCountMsg, 'manage_options', 'WPP_show_error_page', 'WPPortfolio_showErrorPage');
}


/**
 * Functions called when plugin initialises with WordPress.
 */
function WPPortfolio_init()
{	
	// Backend
	if (is_admin())
	{
		// Warning boxes in admin area only
		add_action('admin_notices', 'WPPortfolio_messages');
		
		// Menus
		add_action('admin_menu', 'WPPortfolio_menu');
		
		// Scripts and styles
		add_action('admin_print_scripts', 'WPPortfolio_scripts_Backend'); 
		add_action('admin_print_styles',  'WPPortfolio_styles_Backend');	
	}
	
	// Frontend
	else {
		
		// Scripts and styles
		add_action('wp_head', 'WPPortfolio_styles_frontend_renderCSS');
		WPPortfolio_scripts_Frontend();
	}
	
	// Common
	// Add settings link to plugins page
	$plugin = plugin_basename(__FILE__); 
	add_filter("plugin_action_links_$plugin", 'WPPortfolio_plugin_addSettingsLink');
}
add_action('init', 'WPPortfolio_init');



/**
 * Messages to show the user in the admin area.
 */
function WPPortfolio_messages()
{
	// Request that the user selects an account type.
	$accountType = get_option('WPPortfolio_setting_stw_account_type');
	if ($accountType != 'free' && $accountType != 'paid') {
		WPPortfolio_showMessage(sprintf(__('WP Portfolio has been upgraded, and there\'s been a slight settings change. Please choose your Shrink The Web account type in the <a href="%s#stw-account">Portfolio Settings</a>', 
		'wp-portfolio'), WPP_SETTINGS), true);
	}
}


/**
 * Determine if we're on a page just related to WP Portfolio in the admin area.
 * @return Boolean True if we're on a WP Portfolio admin page, false otherwise.
 */
function WPPortfolio_areWeOnWPPPage()
{
	if (isset($_GET) && isset($_GET['page']))
	{ 
		$currentPage = $_GET['page'];
		
		// This handles any WPPortfolio page.
		if ($currentPage == 'wp-portfolio/wp-portfolio.php' || substr($currentPage, 0, 4) == 'WPP_') {
			return true;
		}	
	}
	 
	return false;
}






/**
 * Page that shows a list of websites in your portfolio.
 */
function WPPortfolio_show_websites()
{
?>
<div class="wrap">
	<div id="icon-themes" class="icon32">
	<br/>
	</div>
	<h2><?php _e('Summary of Websites in your Portfolio', 'wp-portfolio'); ?></h2>
	<br>
<?php 		

    // See if a group parameter was specified, if so, use that to show websites
    // in just that group
    $groupid = false;
    if (isset($_GET['groupid'])) {
    	$groupid = $_GET['groupid'] + 0;
    }
    
	$siteid = 0;
	if (isset($_GET['siteid'])) {
		$siteid = (is_numeric($_GET['siteid']) ? $_GET['siteid'] + 0 : 0);
	}	    

	global $wpdb;
	$websites_table = $wpdb->prefix . TABLE_WEBSITES;
	$groups_table   = $wpdb->prefix . TABLE_WEBSITE_GROUPS;

	
	// ### DELETE Check if we're deleting a website
	if ($siteid > 0 && isset($_GET['delete']))
	{
		$websitedetails = WPPortfolio_getWebsiteDetails($siteid);
		
		if (isset($_GET['confirm']))
		{
			$delete_website = "DELETE FROM $websites_table WHERE siteid = '".$wpdb->escape($siteid)."' LIMIT 1";
			if ($wpdb->query( $delete_website )) {
				WPPortfolio_showMessage(__("Website was successfully deleted.", 'wp-portfolio'));
			}
			else {
				WPPortfolio_showMessage(__("Sorry, but an unknown error occured whist trying to delete the selected website from the portfolio.", 'wp-portfolio'), true);
			}
		}
		else
		{
			$message = sprintf(__('Are you sure you want to delete "%1$s" from your portfolio?<br/><br/> <a href="%2$s">Yes, delete.</a> &nbsp; <a href="%3$s">NO!</a>', 'wp-portfolio'), $websitedetails['sitename'], WPP_WEBSITE_SUMMARY.'&delete=yes&confirm=yes&siteid='.$websitedetails['siteid'], WPP_WEBSITE_SUMMARY);
			WPPortfolio_showMessage($message);
			return;
		}
	}		
	
	// ### DUPLICATE Check - creating a copy of a website
	else if ($siteid > 0 && isset($_GET['duplicate']))
	{
		// Get website details and check they are valid
		$websitedetails = WPPortfolio_getWebsiteDetails($siteid);
		if ($websitedetails)
		{
			// Copy details we need for the update message
			$nameOriginal   = stripslashes($websitedetails['sitename']);
			$siteidOriginal = $websitedetails['siteid'];
			
			// Remove existing siteid (so we can insert a fresh copy)
			// Make it clear that the website was copied by changing the site title.
			unset($websitedetails['siteid']);
			$websitedetails['sitename'] = $nameOriginal . ' (Copy)';
			
			// Insert new copy:
			$SQL = arrayToSQLInsert($websites_table, $websitedetails);
			$wpdb->insert($websites_table, $websitedetails);
			$siteidNew = $wpdb->insert_id;
			
			// Create summary message with links to edit the websites.
			$editOriginal	= sprintf('<a href="'.WPP_MODIFY_WEBSITE.'&editmode=edit&siteid=%s" title="'.__('Edit', 'wp-portfolio').' \'%s\'">%s</a>', $siteidOriginal, $nameOriginal, $nameOriginal);
			$editNew   		= sprintf('<a href="'.WPP_MODIFY_WEBSITE.'&editmode=edit&siteid=%s" title="'.__('Edit', 'wp-portfolio').' \'%s\'">%s</a>', $siteidNew, $websitedetails['sitename'], $websitedetails['sitename']);
			
			$message = sprintf(__('The website \'%s\' was successfully copied to \'%s\'', 'wp-portfolio'),$editOriginal, $editNew);
			WPPortfolio_showMessage($message);
		}
	}
	

	// Determine if showing only 1 group
	$WHERE_CLAUSE = false;
	if ($groupid > 0) {
		$WHERE_CLAUSE = "WHERE $groups_table.groupid = '$groupid'";
	}
	
	// Default sort method
	$sorting = "grouporder, groupname, siteorder, sitename";
	
	// Work out how to sort
	if (isset($_GET['sortby'])) {
		$sortby = strtolower($_GET['sortby']);
		
		switch ($sortby) {
			case 'sitename':
				$sorting = "sitename ASC";
				break;
			case 'siteurl':
				$sorting = "siteurl ASC";
				break;			
			case 'siteadded':
				$sorting = "siteadded DESC, sitename ASC";
				break;
		}
	}		
	
	// Get website details, merge with group details
	$SQL = "SELECT *, UNIX_TIMESTAMP(siteadded) as dateadded FROM $websites_table
			LEFT JOIN $groups_table ON $websites_table.sitegroup = $groups_table.groupid
			$WHERE_CLAUSE
			ORDER BY $sorting	 		
	 		";	
		
	
	$wpdb->show_errors();
	$websites = $wpdb->get_results($SQL, OBJECT);	
			
	// Only show table if there are websites to show
	if ($websites)
	{
		$baseSortURL = WPP_WEBSITE_SUMMARY;
		if ($groupid > 0) {
			$baseSortURL .= "&groupid=".$groupid;
		}
		
		?>
		<div class="websitecount">
			<?php
				// If just showing 1 group
				if ($groupid > 0) {
					echo sprintf(__('Showing <strong>%s</strong> websites in the \'%s\' group (<a href="%s" class="showall">or Show All</a>). To only show the websites in this group, use %s', 'wp-portfolio'), $wpdb->num_rows, $websites[0]->groupname, WPP_WEBSITE_SUMMARY, '<code>[wp-portfolio groups="'.$groupid.'"]</code>');
				} else {
					echo sprintf(__('Showing <strong>%s</strong> websites in the portfolio.', 'wp-portfolio'), $wpdb->num_rows);
				}							
			?>
			
		
		</div>
		
		<div class="subsubsub">
			<strong><?php _e('Sort by:', 'wp-portfolio'); ?></strong>
			<?php echo sprintf(__('<a href="%s" title="Sort websites in the order you\'ll see them within your portfolio.">Normal Ordering</a>', 'wp-portfolio'), $baseSortURL); ?>
			|
			<?php echo sprintf(__('<a href="%s" title="Sort the websites by name.">Name</a>', 'wp-portfolio'), $baseSortURL.'&sortby=sitename'); ?>
			|
			<?php echo sprintf(__('<a href="%s" title="Sort the websites by URL.">URL</a>', 'wp-portfolio'), $baseSortURL.'&sortby=siteurl'); ?>
			|
			<?php echo sprintf(__('<a href="%s" title="Sort the websites by the date that the websites were added.">Date Added</a>', 'wp-portfolio'), $baseSortURL.'&sortby=siteadded'); ?>
		</div>
		<br/>
		<?php 
		
		$table = new TableBuilder();
		$table->attributes = array("id" => "wpptable");

		$column = new TableColumn(__("ID", 'wp-portfolio'), "id");
		$column->cellClass = "wpp-id";
		$table->addColumn($column);
		
		$column = new TableColumn(__("Thumbnail", 'wp-portfolio'), "thumbnail");
		$column->cellClass = "wpp-thumbnail";
		$table->addColumn($column);
		
		$column = new TableColumn(__("Site Name", 'wp-portfolio'), "sitename");
		$column->cellClass = "wpp-name";
		$table->addColumn($column);
		
		$column = new TableColumn(__("URL", 'wp-portfolio'), "siteurl");
		$column->cellClass = "wpp-url";
		$table->addColumn($column);
		
		$column = new TableColumn(__("Date Added", 'wp-portfolio'), "dateadded");
		$column->cellClass = "wpp-date-added";
		$table->addColumn($column);

		$column = new TableColumn(__("Custom Info", 'wp-portfolio'), "custominfo");
		$column->cellClass = "wpp-customurl";
		$table->addColumn($column);						
		
		$column = new TableColumn(__("Visible?", 'wp-portfolio'), "siteactive");
		$column->cellClass = "wpp-small";
		$table->addColumn($column);						
		
		$column = new TableColumn(__("Link Displayed?", 'wp-portfolio'), "displaylink");
		$column->cellClass = "wpp-small";
		$table->addColumn($column);

		$column = new TableColumn(__("Ordering", 'wp-portfolio'), "siteorder");
		$column->cellClass = "wpp-small";
		$table->addColumn($column);
		
		$column = new TableColumn(__("Group", 'wp-portfolio'), "group");
		$column->cellClass = "wpp-small";
		$table->addColumn($column);
					
		$column = new TableColumn(__("Action", 'wp-portfolio'), "action");
		$column->cellClass = "wpp-small wpp-action-links";
		$column->headerClass = "wpp-action-links";		
		$table->addColumn($column);							
			
		// Got a paid account?
		$paidAccount = WPPortfolio_isPaidAccount();
			
		
		foreach ($websites as $websitedetails)
		{
			// First part of a link to visit a website
			$websiteClickable = '<a href="'.$websitedetails->siteurl.'" target="_new" title="'.__('Visit the website', 'wp-portfolio').' \''.stripslashes($websitedetails->sitename).'\'">';
			$editClickable    = '<a href="'.WPP_MODIFY_WEBSITE.'&editmode=edit&siteid='.$websitedetails->siteid.'" title="'.__('Edit', 'wp-portfolio').' \''.stripslashes($websitedetails->sitename).'\'" class="wpp-edit">';
			
			$rowdata = array();
			$rowdata['id'] 			= $websitedetails->siteid;			
			$rowdata['dateadded']	= date('D jS M Y \a\t H:i', $websitedetails->dateadded);
			
			$rowdata['sitename'] 	= stripslashes($websitedetails->sitename);			
			$rowdata['siteurl'] 	= $websiteClickable.$websitedetails->siteurl.'</a>';			
			
			// Custom URL will typically not be specified, so show n/a for clarity.
			if ($websitedetails->customthumb)
			{
				// Use custom thumbnail rather than screenshot
				$rowdata['thumbnail'] 	= '<img src="'.WPPortfolio_getAdjustedCustomThumbnail($websitedetails->customthumb, "sm").'" />';
				
				$customThumb = '<a href="'.$websitedetails->customthumb.'" target="_new" title="'.__('Open custom thumbnail in a new window', 'wp-portfolio').'">'.__('View Image', 'wp-portfolio').'</a>';
			} 
			// Not using custom thumbnail
			else 
			{
				$rowdata['thumbnail'] 	= WPPortfolio_getThumbnailHTML($websitedetails->siteurl, "sm", ($websitedetails->specificpage == 1)); 
				$customThumb = false;
			}
			
			// Custom Info column - only show custom info if it exists.
			$rowdata['custominfo'] = false;			
			
			if ($customThumb) {
				$rowdata['custominfo']		= sprintf('<span class="wpp-custom-thumb"><b>'.__('Custom Thumb', 'wp-portfolio').':</b><br/>%s</span>', $customThumb);
			}
			
			if ($websitedetails->customfield) {
				$rowdata['custominfo']		.= sprintf('<span class="wpp-custom-field"><b>'.__('Custom Field', 'wp-portfolio').':</b><br/>%s</span>', $websitedetails->customfield);
			}

			// Ensure there's just a dash if there's no custom information.
			if ($rowdata['custominfo'] == false) {
				$rowdata['custominfo'] = '-';
			}
			
			
			$rowdata['siteorder']   = $websitedetails->siteorder; 
			$rowdata['siteactive']  = ($websitedetails->siteactive ? __('Yes', 'wp-portfolio') : '<b>'.__('No', 'wp-portfolio').'</b>'); 
			$rowdata['displaylink']  = ($websitedetails->displaylink ? __('Yes', 'wp-portfolio') : '<b>'.__('No', 'wp-portfolio').'</b>'); 
			$rowdata['group'] 		= sprintf('<a href="'.WPP_WEBSITE_SUMMARY.'&groupid='.$websitedetails->groupid.'" title="'.__('Show websites only in the \'%s\' group', 'wp-portfolio').'">'.stripslashes($websitedetails->groupname).'</a>', stripslashes($websitedetails->groupname));
			
			
			// Refresh link			 
			$refreshAction = '&bull; <a href="'.WPP_WEBSITE_SUMMARY.'&refresh=yes&siteid='.$websitedetails->siteid.'" class="wpp-refresh" title="'.__('Force a refresh of the thumbnail', 'wp-portfolio').'">'.__('Refresh', 'wp-portfolio').'</a>';			
			
			// The various actions - Delete | Duplicate | Edit
			$rowdata['action'] 		= $refreshAction . '<br/>' .
									  '&bull; '.$editClickable.__('Edit', 'wp-portfolio').'</a><br/>' . 
									  '&bull; <a href="'.WPP_WEBSITE_SUMMARY.'&duplicate=yes&siteid='.$websitedetails->siteid.'" title="'.__('Duplicate this website', 'wp-portfolio').'">'.__('Duplicate', 'wp-portfolio').'</a><br/>' .
									  '&bull; <a href="'.WPP_WEBSITE_SUMMARY.'&delete=yes&siteid='.$websitedetails->siteid.'" title="'.__('Delete this website...', 'wp-portfolio').'">'.__('Delete', 'wp-portfolio').'</a><br/>' 
									  ; 
			;
		
			$table->addRow($rowdata, ($websitedetails->siteactive ? 'site-active' : 'site-inactive'));
		}
		
		// Finally show table
		echo $table->toString();
		
		// Add AJAX loader URL to page, so that it's easier to use the loader image.
		printf('<div id="wpp-loader">%simgs/ajax-loader.gif</div>', WPPortfolio_getPluginPath());
		
		echo "<br/>";
		
	} // end of if websites
	else {
		WPPortfolio_showMessage(__("There are currently no websites in the portfolio.", 'wp-portfolio'), true);
	}
	
	?>	
</div>
<?php 
	
}

/**
 * Show the error logging summary page.
 */
function WPPortfolio_showErrorPage() 
{
	global $wpdb;
	$wpdb->show_errors();
	$table_debug = $wpdb->prefix . TABLE_WEBSITE_DEBUG;	

	
	// Check for clear of logs
	if (isset($_POST['wpp-clear-logs']))
	{
		$SQL = "TRUNCATE $table_debug";
		$wpdb->query($SQL);
		
		WPPortfolio_showMessage(__('Debug logs have successfully been emptied.', 'wp-portfolio'));
	}
	
	
	?>
	<div class="wrap">
	<div id="icon-tools" class="icon32">
	<br/>
	</div>
	<h2>Error Log</h2>
		
		<form class="wpp-button-right" method="post" action="<?= str_replace( '%7E', '~', $_SERVER['REQUEST_URI']); ?>">
			<input type="submit" name="wpp-refresh-logs" value="<?php _e('Refresh Logs', 'wp-portfolio'); ?>" class="button-primary" />
			<input type="submit" name="wpp-clear-logs" value="<?php _e('Clear Logs', 'wp-portfolio'); ?>" class="button-secondary" />
			<div class="wpp-clear"></div>
		</form>
	<br/>
	
	<?php 
		
		$SQL = "SELECT *, UNIX_TIMESTAMP(request_date) AS request_date_ts
				FROM $table_debug
				ORDER BY request_date DESC
				LIMIT 50
				";
		
		$wpdb->show_errors();
		$logMsgs = $wpdb->get_results($SQL, OBJECT);

		if ($logMsgs)
		{
			printf('<div id="wpp_error_count">'.__('Showing a total of <b>%d</b> log messages.</div>', 'wp-portfolio'), $wpdb->num_rows);
			
			echo '<p>'.__('All errors are <b>cached for 12 hours</b> so that your thumbnail allowance with STW does not get used up if you have persistent errors.', 'wp-portfolio').'<br>';
			echo __('If you\'ve <b>had errors</b>, and you\'ve <b>now fixed them</b>, you can click on the \'<b>Clear Logs</b>\' button on the right to <b>flush the error cache</b> and re-attempt to fetch a thumbnail.', 'wp-portfolio').'</p>';
			
			$table = new TableBuilder();
			$table->attributes = array("id" => "wpptable_error_log");
	
			$column = new TableColumn(__("ID", 'wp-portfolio'), "id");
			$column->cellClass = "wpp-id";
			$table->addColumn($column);
			
			$column = new TableColumn(__("Result", 'wp-portfolio'), "request_result");
			$column->cellClass = "wpp-result";
			$table->addColumn($column);			
			
			$column = new TableColumn(__("Requested URL", 'wp-portfolio'), "request_url");
			$column->cellClass = "wpp-url";
			$table->addColumn($column);
			
			$column = new TableColumn(__("Type", 'wp-portfolio'), "request_type");
			$column->cellClass = "wpp-type";
			$table->addColumn($column);
			
			$column = new TableColumn(__("Request Date", 'wp-portfolio'), "request_date");
			$column->cellClass = "wpp-request-date";
			$table->addColumn($column);
			
			$column = new TableColumn(__("Detail", 'wp-portfolio'), "request_detail");
			$column->cellClass = "wpp-detail";
			$table->addColumn($column);

			
			foreach ($logMsgs as $logDetail)
			{
				$rowdata = array();
				$rowdata['id'] 				= $logDetail->logid;
				$rowdata['request_url'] 	= $logDetail->request_url;
				$rowdata['request_type'] 	= $logDetail->request_type;
				$rowdata['request_result'] 	= '<span>'.($logDetail->request_result == 1 ? __('Success', 'wp-portfolio') : __('Error', 'wp-portfolio')).'</span>';
				$rowdata['request_date'] 	= $logDetail->request_date . '<br/>' . 'about '. human_time_diff($logDetail->request_date_ts) . ' ago';
				$rowdata['request_detail'] 	= $logDetail->request_detail;
				
				$table->addRow($rowdata, ($logDetail->request_result == 1 ? 'wpp_success' : 'wpp_error'));
			}
			
			// Finally show table
			echo $table->toString();
			echo "<br/>";
		}
		else {
			printf('<div class="wpp_clear"></div>');
			WPPortfolio_showMessage(__("There are currently no debug logs to show.", 'wp-portfolio'), true);
		}
	
	?>
	
	</div><!-- end wrapper -->	
	<?php 
}



/**
 * Shows the page listing the available groups.
 */
function WPPortfolio_show_website_groups()
{
?>
<div class="wrap">
	<div id="icon-edit" class="icon32">
	<br/>
	</div>
	<h2><?php _e('Website Groups', 'wp-portfolio'); ?></h2>
	<br/>

	<?php 
	global $wpdb;
	$groups_table = $wpdb->prefix . TABLE_WEBSITE_GROUPS;
	$websites_table = $wpdb->prefix . TABLE_WEBSITES;
	
    // Get group ID
    $groupid = false;
    if (isset($_GET['groupid'])) {
    	$groupid = $_GET['groupid'] + 0;
    }	
	
	// ### DELETE ### Check if we're deleting a group
	if ($groupid > 0 && isset($_GET['delete'])) 
	{				
		// Now check that ID actually relates to a real group
		$groupdetails = WPPortfolio_getGroupDetails($groupid);
		
		// If group doesn't really exist, then stop.
		if (count($groupdetails) == 0) {
			WPPortfolio_showMessage(sprintf(__('Sorry, but no group with that ID could be found. Please click <a href="%s">here</a> to return to the list of groups.', 'wp-portfolio'), WPP_GROUP_SUMMARY), true);
			return;
		}
		
		// Count the number of websites in this group and how many groups exist
		$website_count = $wpdb->get_var("SELECT COUNT(*) FROM $websites_table WHERE sitegroup = '".$wpdb->escape($groupdetails['groupid'])."'");
		$group_count   = $wpdb->get_var("SELECT COUNT(*) FROM $groups_table");
		
		$groupname = stripcslashes($groupdetails['groupname']);
		
		// Check that group doesn't have a load of websites assigned to it.
		if ($website_count > 0)  {
			WPPortfolio_showMessage(sprintf(__("Sorry, the group '%s' still contains <b>$website_count</b> websites. Please ensure the group is empty before deleting it.", 'wp-portfolio'), $groupname) );
			return;
		}
		
		// If we're deleting the last group, don't let it happen
		if ($group_count == 1)  {
			WPPortfolio_showMessage(sprintf(__("Sorry, but there needs to be at least 1 group in the portfolio. Please add a new group before deleting %s", 'wp-portfolio'), $groupname) );
			return;
		}
		
		// OK, got this far, confirm we want to delete.
		if (isset($_GET['confirm']))
		{
			$delete_group = "DELETE FROM $groups_table WHERE groupid = '".$wpdb->escape($groupid)."' LIMIT 1";
			if ($wpdb->query( $delete_group )) {
				WPPortfolio_showMessage(__("Group was successfully deleted.", 'wp-portfolio'));
			}
			else {
				WPPortfolio_showMessage(__("Sorry, but an unknown error occured whist trying to delete the selected group from the portfolio.", 'wp-portfolio'), true);
			}
		}
		else
		{
			$message = sprintf(__('Are you sure you want to delete the group \'%1$s\' from your portfolio?<br/><br/> <a href="%2$s">Yes, delete.</a> &nbsp; <a href="%3$s">NO!</a>', 'wp-portfolio'), $groupname, WPP_GROUP_SUMMARY.'&delete=yes&confirm=yes&groupid='.$groupid, WPP_GROUP_SUMMARY);
			WPPortfolio_showMessage($message);
			return;
		}
	}	
	
	
	
	// Get website details, merge with group details
	$SQL = "SELECT * FROM $groups_table
	 		ORDER BY grouporder, groupname";	
	
	// DEBUG Uncomment if needed
	// $wpdb->show_errors();
	$groups = $wpdb->get_results($SQL, OBJECT);
		
	
	// Only show table if there are any results.
	if ($groups)
	{					
		$table = new TableBuilder();
		$table->attributes = array("id" => "wpptable");

		$column = new TableColumn(__("ID", 'wp-portfolio'), "id");
		$column->cellClass = "wpp-id";
		$table->addColumn($column);		
		
		$column = new TableColumn(__("Name", 'wp-portfolio'), "name");
		$column->cellClass = "wpp-name";
		$table->addColumn($column);	

		$column = new TableColumn(__("Description", 'wp-portfolio'), "description");
		$table->addColumn($column);	

		$column = new TableColumn(__("# Websites", 'wp-portfolio'), "websitecount");
		$column->cellClass = "wpp-small wpp-center";
		$table->addColumn($column);			
		
		$column = new TableColumn(__("Ordering", 'wp-portfolio'), "ordering");
		$column->cellClass = "wpp-small wpp-center";
		$table->addColumn($column);		
		
		$column = new TableColumn(__("Action", 'wp-portfolio'), "action");
		$column->cellClass = "wpp-small action-links";
		$column->headerClass = "action-links";
		$table->addColumn($column);		
		
		echo '<p>'.__('The websites will be rendered in groups in the order shown in the table.', 'wp-portfolio').'</p>';
		
		foreach ($groups as $groupdetails) 
		{
			$groupClickable = sprintf('<a href="'.WPP_WEBSITE_SUMMARY.'&groupid='.$groupdetails->groupid.'" title="'.__('Show websites only in the \'%s\' group">', 'wp-portfolio'), $groupdetails->groupname);
			
			// Count websites in this group
			$website_count = $wpdb->get_var("SELECT COUNT(*) FROM $websites_table WHERE sitegroup = '".$wpdb->escape($groupdetails->groupid)."'");
			
			$rowdata = array();
			
			$rowdata['id']			 	= $groupdetails->groupid;
			$rowdata['name']		 	= $groupClickable.stripslashes($groupdetails->groupname).'</a>';
			$rowdata['description']	 	= stripslashes($groupdetails->groupdescription);
			$rowdata['websitecount'] 	= $groupClickable.$website_count.($website_count == 1 ? ' website' : ' websites')."</a>";
			$rowdata['ordering']	 	= $groupdetails->grouporder;
			$rowdata['action']		 	= '<a href="'.WPP_GROUP_SUMMARY.'&delete=yes&groupid='.$groupdetails->groupid.'">'.__('Delete', 'wp-portfolio').'</a>&nbsp;|&nbsp;' .
										  '<a href="'.WPP_MODIFY_GROUP.'&editmode=edit&groupid='.$groupdetails->groupid.'">'.__('Edit', 'wp-portfolio').'</a></td>';
			
			$table->addRow($rowdata);
		}
		
		
		// Finally show table
		echo $table->toString();
		echo "<br/>";		
		
	} // end of if groups
	
	// No groups to show
	else {
		WPPortfolio_showMessage(__("There are currently no groups in the portfolio.", 'wp-portfolio'), true);
	}
	?>
</div>
<?php 
	
}


/**
 * Shows the page that allows the details of a website to be modified or added to the portfolio.
 */
function WPPortfolio_modify_website()
{
	// Determine if we're in edit mode. Ensure we get correct mode regardless of where it is.
	$editmode = false;
	if (isset($_POST['editmode'])) {
		$editmode = ($_POST['editmode'] == 'edit');
	} else if (isset($_GET['editmode'])) {
		$editmode = ($_GET['editmode'] == 'edit');
	}	
	
	// Get the site ID. Ensure we get ID regardless of where it is.
	$siteid = 0;
	if (isset($_POST['website_siteid'])) {
		$siteid = (is_numeric($_POST['website_siteid']) ? $_POST['website_siteid'] + 0 : 0);
	} else if (isset($_GET['siteid'])) {
		$siteid = (is_numeric($_GET['siteid']) ? $_GET['siteid'] + 0 : 0);
	}	
	
	// Work out page heading
	$verb = __("Add New", 'wp-portfolio');
	if ($editmode) { 
		$verb = __("Modify", 'wp-portfolio');
	}
	
	?>
	<div class="wrap">
	<div id="icon-themes" class="icon32">
	<br/>
	</div>
	<h2><?php echo $verb.' '.__('Website Details', 'wp-portfolio'); ?></h2>	
	<?php 	
		
	
	// Check id is a valid number if editing $editmode
	if ($editmode && $siteid == 0) {
		WPPortfolio_showMessage(sprintf(__('Sorry, but no website with that ID could be found. Please click <a href="%s">here</a> to return to the list of websites.', 'wp-portfolio'), WPP_WEBSITE_SUMMARY), true);
		return;
	}	
	

	// If we're editing, try to get the website details.
	if ($editmode && $siteid > 0)
	{
		// Get details from the database
		$websitedetails = WPPortfolio_getWebsiteDetails($siteid);

		// False alarm, couldn't find it.
		if (count($websitedetails) == 0) {
			$editmode = false;
		}		
	} // end of editing check
	
	// Add Mode, so specify defaults
	else {
		$websitedetails['siteactive'] = 1;
		$websitedetails['displaylink'] = 1;
	}
	
	
	// Check if website is being added, if so, add to the database.
	if ( isset($_POST) && isset($_POST['update']) )
	{
		// Grab specified details
		$data = array();
		$data['siteid'] 			= $_POST['website_siteid'];
		$data['sitename'] 			= trim(strip_tags($_POST['website_sitename']));
		$data['siteurl'] 			= trim(strip_tags($_POST['website_siteurl']));
		$data['sitedescription'] 	= $_POST['website_sitedescription'];
		$data['sitegroup'] 			= $_POST['website_sitegroup'];
		$data['customthumb']		= trim(strip_tags($_POST['website_customthumb']));
		$data['siteactive']			= trim(strip_tags($_POST['website_siteactive']));
		$data['displaylink']		= trim(strip_tags($_POST['website_displaylink']));
		$data['siteorder']			= trim(strip_tags($_POST['website_siteorder'])) + 0;
		$data['specificpage']	    = trim(strip_tags($_POST['website_specificpage']));		
		$data['customfield'] 		= trim(strip_tags($_POST['website_customfield']));
		$data['siteadded']			= trim(strip_tags($_POST['siteadded']));
		
		// Keep track of errors for validation
		$errors = array();
				
		// Ensure all fields have been completed
		if (!($data['sitename'] && $data['siteurl'] && $data['sitedescription']) ) {
			array_push($errors, __("Please check that you have completed the site name, url and description fields.", 'wp-portfolio'));
		}

		// Check custom field length
		if (strlen($data['customfield']) > 255) {
			array_push($errors, __("Sorry, but the custom field is limited to a maximum of 255 characters.", 'wp-portfolio'));
		}
		
		// Check that the date is correct
		if ($data['siteadded']) 
		{
			$dateTS = 0; //strtotime($data['siteadded']);
			if (preg_match('/^([0-9]{4}\-[0-9]{2}\-[0-9]{2} [0-9]{2}\:[0-9]{2}\:[0-9]{2})$/', $data['siteadded'], $matches)) {
				$dateTS = strtotime($data['siteadded']);
			}
			
			// Invalid date
			if ($dateTS == 0) {
				array_push($errors, __("Sorry, but the 'Date Added' date format was not recognised. Please enter a date in the format <em>'yyyy-mm-dd hh:mm:ss'</em>.", 'wp-portfolio'));
			}
			
			// Valid Date
			else {
				$data['siteadded'] = date('Y-m-d H:i:s', $dateTS); 
			}
		} 
		
		else {
			// Date is blank, so create correct one.
			$data['siteadded'] = date('Y-m-d H:i:s'); 
		}
		
		// Continue if there are no errors
		if (count($errors) == 0)
		{
			global $wpdb;
			$table_name = $wpdb->prefix . TABLE_WEBSITES;
			
			// Change query based on add or edit
			if ($editmode) {						
				$query = arrayToSQLUpdate($table_name, $data, 'siteid');
			}

			// Add
			else {
				unset($data['siteid']); // Don't need id for an insert

				$data['siteadded'] = date('Y-m-d H:i:s'); // Only used if adding a website.
				
				$query = arrayToSQLInsert($table_name, $data);	
			}			
						
			// Try to put the data into the database
			$wpdb->show_errors();
			$wpdb->query($query);
			
			// When adding, clean fields so that we don't show them again.
			if ($editmode) {
				WPPortfolio_showMessage(__("Website details successfully updated.", 'wp-portfolio'));
				
				// Retrieve the details from the database again
				$websitedetails = WPPortfolio_getWebsiteDetails($siteid);				
			} 
			// When adding, empty the form again
			else
			{	
				WPPortfolio_showMessage(__("Website details successfully added.", 'wp-portfolio'));
					
				$data['siteid'] 			= false;
				$data['sitename'] 			= false;
				$data['siteurl'] 			= false;
				$data['sitedescription'] 	= false;
				$data['sitegroup'] 			= false;
				$data['customthumb']		= false;				
				$data['siteactive']			= 1; // The default is that the website is visible.				
				$data['displaylink']		= 1; // The default is to show the link.			
				$data['siteorder']			= 0;
				$data['specificpage']	    = 0; 
				$data['customfield']		= false;
			}
								
		} // end of error checking
	
		// Handle error messages
		else
		{
			$message = __("Sorry, but unfortunately there were some errors. Please fix the errors and try again.", 'wp-portfolio').'<br><br>';
			$message .= "<ul style=\"margin-left: 20px; list-style-type: square;\">";
			
			// Loop through all errors in the $error list
			foreach ($errors as $errormsg) {
				$message .= "<li>$errormsg</li>";
			}
						
			$message .= "</ul>";
			WPPortfolio_showMessage($message, true);
			$websitedetails = $data;
		}
	}
		
	$form = new FormBuilder();
		
	$formElem = new FormElement("website_sitename", __("Website Name", 'wp-portfolio'));				
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'sitename');
	$formElem->description = __("The proper name of the website.", 'wp-portfolio').' <em>'.__('(Required)', 'wp-portfolio').'</em>';
	$form->addFormElement($formElem);
	
	$formElem = new FormElement("website_siteurl", __("Website URL", 'wp-portfolio'));				
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'siteurl');
	$formElem->description = __("The URL for the website, including the leading", 'wp-portfolio').' <em>http://</em>. <em>'.__('(Required)', 'wp-portfolio').'</em>';
	$form->addFormElement($formElem);	
	
	$formElem = new FormElement("website_sitedescription", __("Website Description", 'wp-portfolio'));				
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'sitedescription');
	$formElem->description = __("The description of your website. HTML is permitted.", 'wp-portfolio').' <em>'.__('(Required)', 'wp-portfolio')."</em>";
	$formElem->setTypeAsTextArea(4, 70);
	$form->addFormElement($formElem);	
	
	global $wpdb;
	$table_name = $wpdb->prefix . TABLE_WEBSITE_GROUPS;
	$SQL = "SELECT * FROM $table_name ORDER BY groupname";	
	$groups = $wpdb->get_results($SQL, OBJECT);	
	$grouplist = array();
	
	foreach ($groups as $group) {
		$grouplist[$group->groupid] =  stripslashes($group->groupname);
	}	
		
	$formElem = new FormElement("website_sitegroup", "Website Group");
	$formElem->setTypeAsComboBox($grouplist);				
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'sitegroup');
	$formElem->description = __("The group you want to assign this website to.", 'wp-portfolio');
	$form->addFormElement($formElem);	
	
	$form->addBreak('advanced-options', '<div id="wpp-hide-show-advanced" class="wpp_hide"><a href="#">'.__('Show Advanced Settings', 'wp-portfolio').'</a></div>');

	$formElem = new FormElement("website_siteactive", __("Show Website?", 'wp-portfolio'));
	$formElem->setTypeAsComboBox(array('1' => __('Show Website', 'wp-portfolio'), '0' => __('Hide Website', 'wp-portfolio')));
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'siteactive');
	$formElem->description = __("By changing this option, you can show or hide a website from the portfolio.", 'wp-portfolio');
	$form->addFormElement($formElem);

	$formElem = new FormElement("website_displaylink", __("Show Link?", 'wp-portfolio'));
	$formElem->setTypeAsComboBox(array('show_link' => __('Show Link', 'wp-portfolio'), 'hide_link' => __('Hide Link', 'wp-portfolio')));
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'displaylink');
	$formElem->description = __("With this option, you can choose whether or not to display the URL to the website.", 'wp-portfolio');
	$form->addFormElement($formElem);
	
	$formElem = new FormElement("siteadded", __("Date Website Added", 'wp-portfolio'));				
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'siteadded');
	$formElem->description = __("Here you can adjust the date in which the website was added to the portfolio. This is useful if you're adding items retrospectively. (valid format is yyyy-mm-dd hh:mm:ss)", 'wp-portfolio');
	$form->addFormElement($formElem);
	
	$formElem = new FormElement("website_siteorder", __("Website Ordering", 'wp-portfolio'));				
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'siteorder');
	$formElem->description = '&bull; '.__("The number to use for ordering the websites. Websites are rendered in ascending order, first by this order value (lowest value first), then by website name.", 'wp-portfolio').'<br/>'.
				'&bull; '.__("e.g. Websites (A, B, C, D) with ordering (50, 100, 0, 50) will be rendered as (C, A, D, B).", 'wp-portfolio').'<br/>'.
				'&bull; '.__("If all websites have 0 for ordering, then the websites are rendered in alphabetical order by name.", 'wp-portfolio');
	$form->addFormElement($formElem);	
			
	
	$formElem = new FormElement("website_customthumb", __("Custom Thumbnail URL", 'wp-portfolio'));				
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'customthumb');
	$formElem->cssclass = "long-text";
	$formElem->description = __("If specified, the URL of a custom thumbnail to use <em>instead</em> of the screenshot of the URL above.", 'wp-portfolio').'<br/>'.
							'&bull; '.__("The image URL must include the leading <em>http://</em>, e.g.", 'wp-portfolio').' <em>http://www.yoursite.com/wp-content/uploads/yourfile.jpg</em><br/>'.
							'&bull; '.__("Leave this field blank to use an automatically generated screenshot of the website specified above.", 'wp-portfolio').'<br/>'.
							'&bull; '.__("Custom thumbnails are automatically resized to match the size of the other thumbnails.", 'wp-portfolio');
	$form->addFormElement($formElem);	
	
	$formElem = new FormElement("website_customfield", __("Custom Field", 'wp-portfolio')."<br/><span class=\"wpp-advanced-feature\">&bull; ".__("Advanced Feature", 'wp-portfolio')."</span>");
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'customfield');
	$formElem->cssclass = "long-text";
	$formElem->description = sprintf(__("Allows you to specify a value that is substituted into the <code><b>%s</b></code> field. This can be any value. Examples of what you could use the custom field for include:", 'wp-portfolio'), WPP_STR_WEBSITE_CUSTOM_FIELD).'<br/>'.
								'&bull; '.__("Affiliate URLs for the actual URL that visitors click on.", 'wp-portfolio').'<br/>'.
								'&bull; '.__("Information as to the type of work a website relates to (e.g. design work, SEO, web development).", 'wp-portfolio');
	$form->addFormElement($formElem);

	
	// Advanced Features
	$formElem = new FormElement("website_specificpage", __("Use Specific Page Capture", 'wp-portfolio')."<br/>".
								"<span class=\"wpp-advanced-feature\">&bull; ".__("Advanced Feature", 'wp-portfolio')."</span><br/>".
								"<span class=\"wpp-stw-paid\">&bull; ".__("STW Paid Account Only", 'wp-portfolio')."</span>");
	$formElem->setTypeAsComboBox(array('0' => __('No - Homepage Only', 'wp-portfolio'), '1' => __('Yes - Show Specific Page', 'wp-portfolio')));				
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'specificpage');
	$formElem->description = '&bull; <b>'.__("Requires Shrink The Web 'Specific Page Capture' Paid (Basic or Plus) feature.", 'wp-portfolio').'</b><br/>'.
							  '&bull; '.__("If enabled show internal web page rather than website's homepage. If in doubt, select <b>'No - Homepage Only'</b>.", 'wp-portfolio');
	$form->addFormElement($formElem);	
	
	// Hidden Elements
	$formElem = new FormElement("website_siteid", false);				
	$formElem->value = WPPortfolio_getArrayValue($websitedetails, 'siteid');
	$formElem->setTypeAsHidden();
	$form->addFormElement($formElem);
	
	$formElem = new FormElement("editmode", false);				
	$formElem->value = ($editmode ? "edit" : "add");
	$formElem->setTypeAsHidden();
	$form->addFormElement($formElem);	
	
	
	$form->setSubmitLabel(($editmode ? __("Update", 'wp-portfolio') : __("Add", 'wp-portfolio')). " ".__("Website Details", 'wp-portfolio'));		
	echo $form->toString();
			
	?>	
	<br><br>
	</div><!-- wrap -->
	<?php 	
}


/**
 * Shows the page that allows a group to be modified.
 */
function WPPortfolio_modify_group()
{
	// Determine if we're in edit mode. Ensure we get correct mode regardless of where it is.
	$editmode = false;
	if (isset($_POST['editmode'])) {
		$editmode = ($_POST['editmode'] == 'edit');
	} else if (isset($_GET['editmode'])) {
		$editmode = ($_GET['editmode'] == 'edit');
	}	
	
	// Get the Group ID. Ensure we get ID regardless of where it is.
	$groupid = 0;
	if (isset($_POST['group_groupid'])) {
		$groupid = (is_numeric($_POST['group_groupid']) ? $_POST['group_groupid'] + 0 : 0);
	} else if (isset($_GET['groupid'])) {
		$groupid = (is_numeric($_GET['groupid']) ? $_GET['groupid'] + 0 : 0);
	}

	$verb = __("Add New", 'wp-portfolio');
	if ($editmode) {
		$verb = __("Modify", 'wp-portfolio');
	}
	
	// Show title to determine action
	?>
	<div class="wrap">
	<div id="icon-edit" class="icon32">
	<br/>
	</div>
	<h2><?php echo $verb.__(' Group Details', 'wp-portfolio'); ?></h2>
	<?php 
	
	// Check id is a valid number if editing $editmode
	if ($editmode && $groupid == 0) {
		WPPortfolio_showMessage(sprintf(__('Sorry, but no group with that ID could be found. Please click <a href="%s">here</a> to return to the list of groups.', 'wp-portfolio'), WPP_GROUP_SUMMARY), true);
		return;
	}	
	$groupdetails = false;

	// ### EDIT ### Check if we're adding or editing a group
	if ($editmode && $groupid > 0)
	{
		// Get details from the database				
		$groupdetails = WPPortfolio_getGroupDetails($groupid);

		// False alarm, couldn't find it.
		if (count($groupdetails) == 0) {
			$editmode = false;
		}
		
	} // end of editing check
			
	// Check if group is being updated/added.
	if ( isset($_POST) && isset($_POST['update']) )
	{
		// Grab specified details
		$data = array();
		$data['groupid'] 			= $groupid;	
		$data['groupname'] 		  	= strip_tags($_POST['group_groupname']);
		$data['groupdescription'] 	= $_POST['group_groupdescription'];
		$data['grouporder'] 		= $_POST['group_grouporder'] + 0; // Add zero to convert to number
						
		// Keep track of errors for validation
		$errors = array();
				
		// Ensure all fields have been completed
		if (!($data['groupname'] && $data['groupdescription'])) {
			array_push($errors, __("Please check that you have completed the group name and description fields.", 'wp-portfolio'));
		}	
		
		// Continue if there are no errors
		if (count($errors) == 0)
		{
			global $wpdb;
			$table_name = $wpdb->prefix . TABLE_WEBSITE_GROUPS;

			// Change query based on add or edit
			if ($editmode) {							
				$query = arrayToSQLUpdate($table_name, $data, 'groupid');
			}

			// Add
			else {
				unset($data['groupid']); // Don't need id for an insert	
				$query = arrayToSQLInsert($table_name, $data);	
			}
			
			// Try to put the data into the database
			$wpdb->show_errors();
			$wpdb->query($query);
			
			// When editing, show what we've just been editing.
			if ($editmode) {
				WPPortfolio_showMessage(__("Group details successfully updated.", 'wp-portfolio'));
				
				// Retrieve the details from the database again
				$groupdetails = WPPortfolio_getGroupDetails($groupid);
			} 
			// When adding, empty the form again
			else {																							
				WPPortfolio_showMessage(__("Group details successfully added.", 'wp-portfolio'));
				
				$groupdetails['groupid'] 			= false;
				$groupdetails['groupname'] 			= false;
				$groupdetails['groupdescription'] 	= false;
				$groupdetails['grouporder'] 		= false;
			}

		} // end of error checking
	
		// Handle error messages
		else
		{
			$message = __("Sorry, but unfortunately there were some errors. Please fix the errors and try again.", 'wp-portfolio').'<br><br>';
			$message .= "<ul style=\"margin-left: 20px; list-style-type: square;\">";
			
			// Loop through all errors in the $error list
			foreach ($errors as $errormsg) {
				$message .= "<li>$errormsg</li>";
			}
						
			$message .= "</ul>";
			WPPortfolio_showMessage($message, true);
			$groupdetails = $data;
		}
	}
	
	$form = new FormBuilder();
	
	$formElem = new FormElement("group_groupname", __("Group Name", 'wp-portfolio'));				
	$formElem->value = WPPortfolio_getArrayValue($groupdetails, 'groupname');
	$formElem->description = __("The name for this group of websites.", 'wp-portfolio');
	$form->addFormElement($formElem);	
	
	$formElem = new FormElement("group_groupdescription", __("Group Description", 'wp-portfolio'));				
	$formElem->value = WPPortfolio_getArrayValue($groupdetails, 'groupdescription');
	$formElem->description = __("The description of your group. HTML is permitted.", 'wp-portfolio');
	$formElem->setTypeAsTextArea(4, 70);
	$form->addFormElement($formElem);		
	
	$formElem = new FormElement("group_grouporder", __("Group Order", 'wp-portfolio'));				
	$formElem->value = WPPortfolio_getArrayValue($groupdetails, 'grouporder');
	$formElem->description = '&bull; '.__("The number to use for ordering the groups. Groups are rendered in ascending order, first by this order value (lowest value first), then by group name.", 'wp-portfolio').'<br/>'.
				'&bull; '.__('e.g. Groups (A, B, C, D) with ordering (50, 100, 0, 50) will be rendered as (C, A, D, B).', 'wp-portfolio').'<br/>'.
				'&bull; '.__("If all groups have 0 for ordering, then the groups are rendered in alphabetical order.", 'wp-portfolio');
	$form->addFormElement($formElem);		
	
	// Hidden Elements
	$formElem = new FormElement("group_groupid", false);				
	$formElem->value = WPPortfolio_getArrayValue($groupdetails, 'groupid');
	$formElem->setTypeAsHidden();
	$form->addFormElement($formElem);
	
	$formElem = new FormElement("editmode", false);				
	$formElem->value = ($editmode ? "edit" : "add");
	$formElem->setTypeAsHidden();
	$form->addFormElement($formElem);	
	
	
	$form->setSubmitLabel(($editmode ? __("Update", 'wp-portfolio') : __("Add", 'wp-portfolio')). " ".__("Group Details", 'wp-portfolio'));		
	echo $form->toString();	
		
	?>		
	<br><br>
	</div><!-- wrap -->
	<?php 	
}

/**
 * Return the list of settings for this plugin.
 * @return Array The list of settings and their default values.
 */
function WPPortfolio_getSettingList($general = true, $style = true)
{
	$generalSettings = array(
		'setting_stw_access_key' 		=> false,
		'setting_stw_secret_key' 		=> false,
		'setting_stw_account_type'		=> false,
		'setting_stw_thumb_size' 		=> 'lg',
		'setting_stw_thumb_size_type'	=> 'standard',
		'setting_stw_thumb_size_custom' => '300',
		'setting_cache_days'	 		=> 7,
		'setting_fetch_method' 			=> 'curl',
		'setting_show_credit' 			=> 'on',	
		'setting_enable_debug'			=> false,
		'setting_scale_type'			=> 'scale-both',
	);
	
	$styleSettings = array(
		'setting_template_website'			=> WPP_DEFAULT_WEBSITE_TEMPLATE,
		'setting_template_group'			=> WPP_DEFAULT_GROUP_TEMPLATE,
		'setting_template_css'				=> WPP_DEFAULT_CSS,
		'setting_template_css_paging'		=> WPP_DEFAULT_CSS_PAGING,
		'setting_template_css_widget'		=> WPP_DEFAULT_CSS_WIDGET,
		'setting_disable_plugin_css'		=> false,
		'setting_template_paging'			=> WPP_DEFAULT_PAGING_TEMPLATE,
		'setting_template_paging_previous'	=> WPP_DEFAULT_PAGING_TEMPLATE_PREVIOUS,
		'setting_template_paging_next'		=> WPP_DEFAULT_PAGING_TEMPLATE_NEXT,
	);
	
	$settingsList = array();
	
	// Want to add general settings?
	if ($general) {
		$settingsList = array_merge($settingsList, $generalSettings);
	}
	
	// Want to add style settings?
	if ($style) {
		$settingsList = array_merge($settingsList, $styleSettings);
	}
	
	return $settingsList;
}


/**
 * Install the WP Portfolio plugin, initialise the default settings, and create the tables for the websites and groups.
 */
function WPPortfolio_install()
{
	// ### Create Default Settings
	$settingsList = WPPortfolio_getSettingList();
	
	// Initialise all settings in the database
	foreach ($settingsList as $settingName => $settingDefault) 
	{
		if (get_option('WPPortfolio_'.$settingName) === FALSE)
		{
			// Set the default option
			update_option('WPPortfolio_'.$settingName, $settingDefault);
		}
	}
							
		
	// Check the current version of the database
	$installed_ver  = get_option("WPPortfolio_version") + 0;
	$current_ver    = WPP_VERSION + 0;
	$upgrade_tables = ($current_ver > $installed_ver);
	
	// Upgrade tables
	WPPortfolio_install_upgradeTables($upgrade_tables);		
	
			
	// Update the version regardless
	update_option("WPPortfolio_version", WPP_VERSION);
	
	// Create cache directory
	WPPortfolio_createCacheDirectory(); 
}
register_activation_hook(__FILE__,'WPPortfolio_install');


/**
 * On deactivation, remove all functions from the scheduled action hook.
 */
function WPPortfolio_plugin_cleanupForDeactivate() {
	wp_clear_scheduled_hook('wpportfolio_schedule_refresh_thumbnails');
}
register_deactivation_hook( __FILE__, 'WPPortfolio_plugin_cleanupForDeactivate');


/**
 * The cron job to refresh thumbnails.
 */
function WPPortfolio_plugin_runThumbnailRefresh()
{ 
	WPPortfolio_thumbnails_refreshAll(0, false, false);
}
add_action('wpportfolio_schedule_refresh_thumbnails', 'WPPortfolio_plugin_runThumbnailRefresh');


/**
 * Function to upgrade tables.
 * @param Boolean $upgradeNow If true, upgrade tables now.
 */
function WPPortfolio_install_upgradeTables($upgradeNow, $showErrors = false, $addSampleData = true)
{
	global $wpdb;
		
	// Table names
	$table_websites	= $wpdb->prefix . TABLE_WEBSITES;
	$table_groups 	= $wpdb->prefix . TABLE_WEBSITE_GROUPS;
	$table_debug    = $wpdb->prefix . TABLE_WEBSITE_DEBUG;
	
	if ($showErrors) {
		$wpdb->show_errors();
	}	
				
	// Check tables exist
	$table_websites_exists	= ($wpdb->get_var("SHOW TABLES LIKE '$table_websites'") == $table_websites);
	$table_groups_exists	= ($wpdb->get_var("SHOW TABLES LIKE '$table_groups'") == $table_groups);
	$table_debug_exists		= ($wpdb->get_var("SHOW TABLES LIKE '$table_debug'") == $table_debug);
	
	// Only enable if debugging	
	//$wpdb->show_errors();

	// #### Create Tables - Websites
	if (!$table_websites_exists || $upgradeNow) 
	{
		$sql = "CREATE TABLE `$table_websites` (
  				   siteid INT(10) unsigned NOT NULL auto_increment,
				   sitename varchar(150),
				   siteurl varchar(255),
				   sitedescription TEXT,
				   sitegroup int(10) unsigned NOT NULL,
				   customthumb varchar(255),
				   customfield varchar(255),
				   siteactive TINYINT NOT NULL DEFAULT '1',
				   displaylink varchar(10) NOT NULL DEFAULT 'show_link',
				   siteorder int(10) unsigned NOT NULL DEFAULT '0',
				   specificpage TINYINT NOT NULL DEFAULT '0',	
				   siteadded datetime default NULL,
				   last_updated datetime default NULL,
				   PRIMARY KEY  (siteid) 
				) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ;";

		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		dbDelta($sql);
				
	}
	
	// Set default date if there isn't one
	$results = $wpdb->query("UPDATE `$table_websites` SET `siteadded` = NOW() WHERE `siteadded` IS NULL OR `siteadded` = '0000-00-00 00:00:00'");
	
	
	// #### Create Tables - Groups
	if (!$table_groups_exists || $upgradeNow)
	{
		$sql = "CREATE TABLE `$table_groups` (
  				   groupid int(10) UNSIGNED NOT NULL auto_increment,
				   groupname varchar(150),
				   groupdescription TEXT,
				   grouporder INT(1) UNSIGNED NOT NULL DEFAULT '0',
				   PRIMARY KEY  (groupid)
				) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ;";
		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		dbDelta($sql);
		
		// Creating new table? Add default group that has ID of 0
		if ($addSampleData)
		{
			$SQL = "INSERT INTO `$table_groups` (groupid, groupname, groupdescription) VALUES (1, 'My Websites', 'These are all my websites.')";
	 		$results = $wpdb->query($SQL);
		}
	}	
	
	// Needed for hard upgrade - existing method of trying to update
	// the table seems to be failing.
	$wpdb->query("DROP TABLE IF EXISTS $table_debug");
	
	// #### Create Tables - Debug Log
	if (!$table_debug_exists || $upgradeNow) 
	{
		$sql = "CREATE TABLE $table_debug (
  				  `logid` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				  `request_url` varchar(255) NOT NULL,
				  `request_param_hash` varchar(35) NOT NULL,
				  `request_result` tinyint(4) NOT NULL DEFAULT '0',
				  `request_error_msg` varchar(30) NOT NULL,
				  `request_detail` text NOT NULL,
				  `request_type` varchar(25) NOT NULL,
				  `request_date` datetime NOT NULL,
  				  PRIMARY KEY  (logid)
				) ENGINE=MyISAM  DEFAULT CHARSET=utf8 ;";

		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		dbDelta($sql);
	}
}


/**
 * Add the custom stylesheet for this plugin.
 */
function WPPortfolio_styles_Backend()
{
	// Only show our stylesheet on a WP Portfolio page to avoid breaking other plugins.
	if (!WPPortfolio_areWeOnWPPPage()) {
		return;
	}
		
	wp_enqueue_style('wpp-portfolio', 			WPPortfolio_getPluginPath() . 'portfolio.css', false, WPP_VERSION);
}



/** 
 * Add the scripts needed for the page for this plugin.
 */
function WPPortfolio_scripts_Backend()
{
	if (!WPPortfolio_areWeOnWPPPage()) 
		return;
		
	// Plugin-specific JS
	wp_enqueue_script('wpl-admin-js', WPPortfolio_getPluginPath() .  'js/wpp-admin.js', array('jquery'), WPP_VERSION);
}


/**
 * Scripts used on front of website.
 */
function WPPortfolio_scripts_Frontend()
{		
}    




/**
 * Get the URL for the plugin path including a trailing slash.
 * @return String The URL for the plugin path.
 */
function WPPortfolio_getPluginPath() {
	return trailingslashit(trailingslashit(WP_PLUGIN_URL) . plugin_basename(dirname(__FILE__)));
}


/**
 * Method called when we want to uninstall the portfolio plugin to remove the database tables.
 */
function WPPortfolio_uninstall() 
{
	// Remove all options from the database
	delete_option('WPPortfolio_setting_stw_access_key');
	delete_option('WPPortfolio_setting_stw_secret_key');	
	delete_option('WPPortfolio_setting_stw_thumb_size');
	delete_option('WPPortfolio_setting_cache_days');
	
	delete_option('WPPortfolio_setting_template_website');
	delete_option('WPPortfolio_setting_template_group');
	delete_option('WPPortfolio_setting_template_css');
	delete_option('WPPortfolio_setting_template_css_paging');
	delete_option('WPPortfolio_setting_template_css_widget');
			
	delete_option('WPPortfolio_version');
		
	
	// Remove all tables for the portfolio
	global $wpdb;
	$table_name    = $wpdb->prefix . TABLE_WEBSITES;
	$uninstall_sql = "DROP TABLE IF EXISTS ".$table_name;
	$wpdb->query($uninstall_sql);
	
	$table_name    = $wpdb->prefix . TABLE_WEBSITE_GROUPS;
	$uninstall_sql = "DROP TABLE IF EXISTS ".$table_name;
	$wpdb->query($uninstall_sql);
		
	$table_name    = $wpdb->prefix . TABLE_WEBSITE_DEBUG;
	$uninstall_sql = "DROP TABLE IF EXISTS ".$table_name;
	$wpdb->query($uninstall_sql);
	
	
	// Remove cache
	$actualThumbPath = WPPortfolio_getThumbPathActualDir();
	WPPortfolio_unlinkRecursive($actualThumbPath);		
		
	WPPortfolio_showMessage(__("Deleted WP Portfolio database entries.", 'wp-portfolio'));
}




/**
 * This method is called just before the <head> tag is closed. We inject our custom CSS into the 
 * webpage here.
 */
function WPPortfolio_styles_frontend_renderCSS() 
{
	// Only render CSS if we've enabled the option
	$setting_disable_plugin_css = strtolower(trim(get_option('WPPortfolio_setting_disable_plugin_css')));
	
	// on = disable, anything else is enable
	if ($setting_disable_plugin_css != 'on')
	{
		$setting_template_css 		 = trim(stripslashes(get_option('WPPortfolio_setting_template_css')));
		$setting_template_css_paging = trim(stripslashes(get_option('WPPortfolio_setting_template_css_paging')));
		$setting_template_css_widget = trim(stripslashes(get_option('WPPortfolio_setting_template_css_widget')));
	
		echo "\n<!-- WP Portfolio Stylesheet -->\n";
		echo "<style type=\"text/css\">\n";
		
		echo $setting_template_css;
		echo $setting_template_css_paging;
		echo $setting_template_css_widget;
		
		echo "\n</style>";
		echo "\n<!-- WP Portfolio Stylesheet -->\n";
	}
}



/**
 * Turn the portfolio of websites in the database into a single page containing details and screenshots using the [wp-portfolio] shortcode.
 * @param $atts The attributes of the shortcode.
 * @return String The updated content for the post or page.
 */
function WPPortfolio_convertShortcodeToPortfolio($atts)
{	
	// Process the attributes
	extract(shortcode_atts(array(
		'groups' 		=> '',
		'hidegroupinfo' => 0,
		'sitesperpage'	=> 0,
		'orderby' 		=> 'asc',
		'ordertype'		=> 'normal',
		'single'		=> 0,
	), $atts));
	
	// Check if single contains a valid item ID
	if (is_numeric($single) && $single > 0) 
	{	
		$websiteDetails = WPPortfolio_getWebsiteDetails($single, OBJECT);
		
		// Portfolio item not found, abort
		if (!$websiteDetails) {
			return sprintf('<p>'.__('Portfolio item <b>ID %d</b> does not exist.', 'wp-portfolio').'</p>', $single); 
		}
		
		// Item found, so render it
		else  {
			return WPPortfolio_renderPortfolio(array($websiteDetails), false, false, false, false);
		}
	
	}
	
	// If hidegroupinfo is 1, then hide group details by passing in a blank template to the render portfolio function
	$grouptemplate = false; // If false, then default group template is used.
	if (isset($atts['hidegroupinfo']) && $atts['hidegroupinfo'] == 1) {
		$grouptemplate = "&nbsp;";
	}
	
	// Sort ASC or DESC?
	$orderAscending = true;
	if (isset($atts['orderby']) && strtolower(trim($atts['orderby'])) == 'desc') {
		$orderAscending = false;
	}
	
	// Convert order type to use normal as default
	$orderType = strtolower(trim(WPPortfolio_getArrayValue($atts, 'ordertype')));
	if ($orderType != 'dateadded') {
		$orderType = 'normal';
	}
	
	// Groups 
	$groups = false;
	if (isset($atts['groups'])) {
		$groups = $atts['groups'];
	}
	
	// Sites per page
	$sitesperpage = 0;
	if (isset($atts['sitesperpage'])) {
		$sitesperpage = $atts['sitesperpage'] + 0;
	}
	
	return WPPortfolio_getAllPortfolioAsHTML($groups, false, $grouptemplate, $sitesperpage, $orderAscending, $orderType);
}
add_shortcode('wp-portfolio', 'WPPortfolio_convertShortcodeToPortfolio');



/**
 * Method to get the portfolio using the specified list of groups and return it as HTML.
 * 
 * @param $groups The comma separated string of group IDs to show.
 * @param $template_website The template used to render each website. If false, the website template defined in the settings is used instead.
 * @param $template_group The template used to render each group header. If false, the group template defined in the settings is used instead.
 * @param $sitesperpage The number of sites to show per page, or false if showing all sites at once. 
 * @param $orderAscending Order websites in ascending order, or if false, order in descending order.
 * @param $orderBy How to order the results (choose from 'normal' or 'dateadded'). Default option is 'normal'. If 'dateadded' is chosen, group names are not shown.
 * @param $count If > 0, only show the specified number of websites. This overrides $sitesperpage.
 * @param $isWidgetTemplate If true, then we're rendering this as a widget layout. 
 * 
 * @return String The HTML which contains the portfolio as HTML.
 */
function WPPortfolio_getAllPortfolioAsHTML($groups = '', $template_website = false, $template_group = false, $sitesperpage = false, $orderAscending = true, $orderBy = 'normal', $count = false, $isWidgetTemplate = false)
{
	// Get portfolio from database
	global $wpdb;
	$websites_table = $wpdb->prefix . TABLE_WEBSITES;
	$groups_table   = $wpdb->prefix . TABLE_WEBSITE_GROUPS;		
		
	// Determine if we only want to show certain groups
	$WHERE_CLAUSE = "";
	if ($groups)
	{ 
		$selectedGroups = explode(",", $groups);
		foreach ($selectedGroups as $possibleGroup)
		{
			// Some matches might be empty strings
			if ($possibleGroup > 0) {
				$WHERE_CLAUSE .= "$groups_table.groupid = '$possibleGroup' OR ";
			}
		}
	} // end of if ($groups)
		
	// Add initial where if needed
	if ($WHERE_CLAUSE)
	{
		// Remove last OR to maintain valid SQL
		if (substr($WHERE_CLAUSE, -4) == ' OR ') {
			$WHERE_CLAUSE = substr($WHERE_CLAUSE, 0, strlen($WHERE_CLAUSE)-4);
		}				
		
		// Selectively choosing groups.
		$WHERE_CLAUSE = sprintf("WHERE (siteactive = 1) AND (%s)", $WHERE_CLAUSE);
	} 
	// Showing whole portfolio, but only active sites.
	else {
		$WHERE_CLAUSE = "WHERE (siteactive = 1)";
	}

	$ORDERBY_ORDERING = "";
	if (!$orderAscending) {
		$ORDERBY_ORDERING = 'DESC';
	}
	
	// How to order the results
	if (strtolower($orderBy) == 'dateadded') {
		$ORDERBY_CLAUSE = "ORDER BY siteadded $ORDERBY_ORDERING, sitename ASC";
		$template_group = ' '; // Disable group names
	} else {
		$ORDERBY_CLAUSE = "ORDER BY grouporder $ORDERBY_ORDERING, groupname $ORDERBY_ORDERING, siteorder $ORDERBY_ORDERING, sitename $ORDERBY_ORDERING";
	}
			
	// Get website details, merge with group details
	$SQL = "SELECT * FROM $websites_table
			LEFT JOIN $groups_table ON $websites_table.sitegroup = $groups_table.groupid
			$WHERE_CLAUSE
		 	$ORDERBY_CLAUSE
		 	";			
					
	$wpdb->show_errors();
	
	$paginghtml = false; 
	
	
	$LIMIT_CLAUSE = false;
	
	// Convert to a number
	$count = $count + 0;
	$sitesperpage = $sitesperpage + 0; 
	
	// Show a limited number of websites	
	if ($count > 0) {
		$LIMIT_CLAUSE = 'LIMIT '.$count;
	}
	
	// Limit the number of sites shown on a single page.	
	else if ($sitesperpage)
	{
		// How many sites do we have?
		$websites = $wpdb->get_results($SQL, OBJECT);
		$website_count = $wpdb->num_rows;
		
		// Paging is needed, as we have more websites than sites/page.
		if ($website_count > $sitesperpage)
		{
			$numofpages = ceil($website_count / $sitesperpage);
			
			// Pick up the page number from the GET variable
			$currentpage = 1;
			if (isset($_GET['portfolio-page']) && ($_GET['portfolio-page'] + 0) > 0) {
				$currentpage = $_GET['portfolio-page'] + 0;
			}			

			// Load paging defaults from the DB
			$setting_template_paging 			= stripslashes(get_option('WPPortfolio_setting_template_paging'));
			$setting_template_paging_next 		= stripslashes(get_option('WPPortfolio_setting_template_paging_next'));
			$setting_template_paging_previous 	= stripslashes(get_option('WPPortfolio_setting_template_paging_previous'));
			

			// Add Previous Jump Links
			if ($numofpages > 1 && $currentpage > 1) { 
				$html_previous = sprintf('&nbsp;<span class="page-jump"><a href="?portfolio-page=%s"><b>%s</b></a></span>&nbsp;', $currentpage-1, $setting_template_paging_previous);
			} else {
				$html_previous = sprintf('&nbsp;<span class="page-jump"><b>%s</b></span>&nbsp;', $setting_template_paging_previous);
			}			
			
			
			// Render the individual pages
			$html_pages = false;
			for ($i = 1; $i <= $numofpages; $i++) 
			{								
				// No link for current page.
				if ($i == $currentpage) {
					$html_pages .= sprintf('&nbsp;<span class="page-jump page-current"><b>%s</b></span>&nbsp;', $i, $i);
				} 
				// Link for other pages 
				else  {
					// Avoid parameter if first page
					if ($i == 1) {
						$html_pages .= sprintf('&nbsp;<span class="page-jump"><a href="?"><b>%s</b></a></span>&nbsp;', $i, $i);
					} else {
						$html_pages .= sprintf('&nbsp;<span class="page-jump"><a href="?portfolio-page=%s"><b>%s</b></a></span>&nbsp;', $i, $i);
					}
				}				
			}
			// Add Next Jump Links
			if ($currentpage < $numofpages) {
				$html_next = sprintf('&nbsp;<span class="page-jump"><a href="?portfolio-page=%s"><b>%s</b></a></span>&nbsp;', $currentpage+1, $setting_template_paging_next);
			} else {
				$html_next = sprintf('&nbsp;<span class="page-jump"><b>%s</b></span>&nbsp;', $setting_template_paging_next);
			}

			

			// Update the SQL for the pages effect
			// Show first page and set limit to start at first record.
			if ($currentpage <= 1) {
				$firstresult = 1;
				$LIMIT_CLAUSE = sprintf("LIMIT 0, %s", $sitesperpage);
			} 
			// Show websites only for current page for inner page
			else
			{
				$firstresult = (($currentpage - 1) * $sitesperpage);
				$LIMIT_CLAUSE = sprintf("LIMIT %s, %s", $firstresult, $sitesperpage);
			}
			
			// Work out the number of the website being shown at the end of the range. 
			$website_endNum = ($currentpage * $sitesperpage);
			if ($website_endNum > $website_count) {
				$website_endNum = $website_count;
			}
			
			
			// Create the paging HTML using the templates.
			$paginghtml = $setting_template_paging;
			
			// Summary info			
			$paginghtml = str_replace('%PAGING_PAGE_CURRENT%', 		$currentpage, 		$paginghtml);
			$paginghtml = str_replace('%PAGING_PAGE_TOTAL%', 		$numofpages, 		$paginghtml);

			$paginghtml = str_replace('%PAGING_ITEM_START%', 		$firstresult, 		$paginghtml);
			$paginghtml = str_replace('%PAGING_ITEM_END%', 			$website_endNum, 	$paginghtml);
			$paginghtml = str_replace('%PAGING_ITEM_TOTAL%', 		$website_count, 	$paginghtml);
			
			// Navigation
			$paginghtml = str_replace('%LINK_PREVIOUS%', 			$html_previous, 	$paginghtml);
			$paginghtml = str_replace('%LINK_NEXT%', 				$html_next, 		$paginghtml);
			$paginghtml = str_replace('%PAGE_NUMBERS%', 			$html_pages, 		$paginghtml);
			
		} // end of if ($website_count > $sitesperpage)
	}
	
	
	// Add the limit clause.
	$SQL .= $LIMIT_CLAUSE;
		
	$websites = $wpdb->get_results($SQL, OBJECT);

	// If we've got websites to show, then render into HTML
	if ($websites) {
		$portfolioHTML = WPPortfolio_renderPortfolio($websites, $template_website, $template_group, $paginghtml, $isWidgetTemplate);
	} else {
		$portfolioHTML = false;
	}
	
	return $portfolioHTML;
}




/**
 * Method to get a random selection of websites from the portfolio using the specified list of groups and return it as HTML. No group details are 
 * returned when showing a random selection of the portfolio.
 * 
 * @param $groups The comma separated string of group IDs to use to find which websites to show. If false, websites are selected from the whole portfolio.
 * @param $count The number of websites to show in the output.
 * @param $template_website The template used to render each website. If false, the website template defined in the settings is used instead.
 * @param $isWidgetTemplate If true, then we're rendering this as a widget layout. 
 * 
 * @return String The HTML which contains the portfolio as HTML.
 */
function WPPortfolio_getRandomPortfolioSelectionAsHTML($groups = '', $count = 3, $template_website = false, $isWidgetTemplate = false)
{
	// Get portfolio from database
	global $wpdb;
	$websites_table = $wpdb->prefix . TABLE_WEBSITES;
	$groups_table   = $wpdb->prefix . TABLE_WEBSITE_GROUPS;		
		
	// Validate the count is a number
	$count = $count + 0;
	
	// Determine if we only want to get websites from certain groups
	$WHERE_CLAUSE = "";
	if ($groups)
	{ 
		$selectedGroups = explode(",", $groups);
		foreach ($selectedGroups as $possibleGroup)
		{
			// Some matches might be empty strings
			if ($possibleGroup > 0) {
				$WHERE_CLAUSE .= "$groups_table.groupid = '$possibleGroup' OR ";
			}
		}
	} // end of if ($groups)
		
	// Add initial where if needed
	if ($WHERE_CLAUSE)
	{
		// Remove last OR to maintain valid SQL
		if (substr($WHERE_CLAUSE, -4) == ' OR ') {
			$WHERE_CLAUSE = substr($WHERE_CLAUSE, 0, strlen($WHERE_CLAUSE)-4);
		}				
		
		$WHERE_CLAUSE = "WHERE siteactive != '0' AND (". $WHERE_CLAUSE . ")";
	}
	// Always hide inactive sites
	else {
		$WHERE_CLAUSE = "WHERE siteactive != '0'";
	}
	
		
	// Limit the number of websites if requested
	$LIMITCLAUSE = false;
	if ($count > 0) {
		$LIMITCLAUSE = 'LIMIT '.$count;
	}
	
			
	// Get website details, merge with group details
	$SQL = "SELECT * FROM $websites_table
			LEFT JOIN $groups_table ON $websites_table.sitegroup = $groups_table.groupid
			$WHERE_CLAUSE
		 	ORDER BY RAND()
		 	$LIMITCLAUSE
		 	";			
					
	$wpdb->show_errors();
	$websites = $wpdb->get_results($SQL, OBJECT);

	// If we've got websites to show, then render into HTML. Use blank group to avoid rendering group details.
	if ($websites) {
		$portfolioHTML = WPPortfolio_renderPortfolio($websites, $template_website, ' ', false, $isWidgetTemplate);
	} else {
		$portfolioHTML = false;
	}
	
	return $portfolioHTML;
}



/**
 * Convert the website details in the database object into the HTML for the portfolio.
 * 
 * @param Array $websites The list of websites as objects.
 * @param String $template_website The template used to render each website. If false, the website template defined in the settings is used instead.
 * @param String $template_group The template used to render each group header. If false, the group template defined in the settings is used instead.
 * @param String $paging_html The HTML used for paging the portfolio. False by default.
 * @param Boolean $isWidgetTemplate If true, then we're rendering this as a widget layout.
 * 
 * @return String The HTML for the portfolio page.
 */
function WPPortfolio_renderPortfolio($websites, $template_website = false, $template_group = false, $paging_html = false, $isWidgetTemplate = false)
{
	if (!$websites)
		return false;
			
	// Just put some space after other content before rendering portfolio.	
	$content = "\n\n";			

	// Used to track what group we're working with.
	$prev_group = "";
	
	// Get templates to use for rendering the website details. Use the defined options if the parameters are false.
	if (!$template_website) {
		$setting_template_website = stripslashes(get_option('WPPortfolio_setting_template_website'));
	} else {
		$setting_template_website = $template_website;		
	}

	if (!$template_group) {
		$setting_template_group = stripslashes(get_option('WPPortfolio_setting_template_group'));						
	} else {
		$setting_template_group = $template_group;	
			
	}
	 	
	
	// Render all the websites, but look after different groups
	foreach ($websites as $websitedetails)
	{
		// If we're rendering a new group, then show the group name and description 
		if ($prev_group != $websitedetails->groupname)
		{
			// Replace group name and description.					
			$renderedstr = WPPortfolio_replaceString(WPP_STR_GROUP_NAME, stripslashes($websitedetails->groupname), $setting_template_group);
			$renderedstr = WPPortfolio_replaceString(WPP_STR_GROUP_DESCRIPTION, stripslashes($websitedetails->groupdescription), $renderedstr);
			
			// Update content with templated group details
			$content .= "\n\n$renderedstr\n";
		}
		
		// Render the website details
		$renderedstr = WPPortfolio_replaceString(WPP_STR_WEBSITE_NAME, 		 	stripslashes($websitedetails->sitename), $setting_template_website);
		$renderedstr = WPPortfolio_replaceString(WPP_STR_WEBSITE_DESCRIPTION, 	stripslashes($websitedetails->sitedescription), $renderedstr);
		$renderedstr = WPPortfolio_replaceString(WPP_STR_WEBSITE_CUSTOM_FIELD, 	stripslashes($websitedetails->customfield), $renderedstr);
		
		
		// Remove website link if requested to
		if ($websitedetails->displaylink == 'hide_link')
		{		
			$renderedstr = preg_replace('/<a\shref="%WEBSITE_URL%"[^>]+>%WEBSITE_URL%<\/a>/i', '', $renderedstr);
		}
		
		$renderedstr = WPPortfolio_replaceString(WPP_STR_WEBSITE_URL, 		 	stripslashes($websitedetails->siteurl), $renderedstr);
		
				
		
		// Handle the thumbnails - use custom if provided.
		$imageURL = false;
		if ($websitedetails->customthumb) 
		{
			$imageURL = WPPortfolio_getAdjustedCustomThumbnail($websitedetails->customthumb);
			$imagetag = sprintf('<img src="%s" alt="%s"/>', $imageURL, stripslashes($websitedetails->sitename));
		} 
		// Standard thumbnail
		else {
			$imagetag = WPPortfolio_getThumbnailHTML($websitedetails->siteurl, false, ($websitedetails->specificpage == 1), stripslashes($websitedetails->sitename)); 			
		}
		$renderedstr = WPPortfolio_replaceString(WPP_STR_WEBSITE_THUMBNAIL_URL, $imageURL, $renderedstr); /// Just URLs		
		$renderedstr = WPPortfolio_replaceString(WPP_STR_WEBSITE_THUMBNAIL, $imagetag, $renderedstr);  // Full image tag
		
		// Handle any shortcodes that we have in the template
		$renderedstr = do_shortcode($renderedstr);
		
		
		$content .= "\n$renderedstr\n";
		
		// If fetching thumbnails, this might take a while. So flush.
		flush();
		
		// Track the groups
		$prev_group = $websitedetails->groupname;
	}
	
	$content .= $paging_html;
	
	// Credit link on portfolio. 
	if (!$isWidgetTemplate && get_option('WPPortfolio_setting_show_credit') == "on") {				
		$content .= sprintf('<div style="clear: both;"></div><div class="wpp-creditlink" style="font-size: 8pt; font-family: Verdana; float: right; clear: both;">'.__('Created using %s by the %s</div>', 'wp-portfolio'), '<a href="http://wordpress.org/extend/plugins/wp-portfolio" target="_blank">WP Portfolio</a>', '<a href="http://www.wpdoctors.co.uk/" target="_blank">WordPress Doctors</a>');
	} 
				
	// Add some space after the portfolio HTML 
	$content .= "\n\n";
	
	return $content;
}



/**
 * Create the cache directory if it doesn't exist.
 * $pathType If specified, the particular cache path to create. If false, use the path stored in the settings.
 */
function WPPortfolio_createCacheDirectory($pathType = false)
{
	// Cache directory
	$actualThumbPath = WPPortfolio_getThumbPathActualDir($pathType);
			
	// Create cache directory if it doesn't exist	
	if (!file_exists($actualThumbPath)) {
		@mkdir($actualThumbPath, 0777, true);		
	} else {
		// Try to make the directory writable
		@chmod($actualThumbPath, 0777);
	}
}

/**
 * Gets the full directory path for the thumbnail directory with a trailing slash.
 * @param $pathType The type of directory to fetch, or just return the one specified in the settings if false. 
 * @return String The full directory path for the thumbnail directory.
 */
function WPPortfolio_getThumbPathActualDir($pathType = false) 
{
	// If no path type is specified, then get the setting from the options table.
	if ($pathType == false) {
		$pathType = WPPortfolio_getCacheSetting();
	}
	
	switch ($pathType)
	{
		case 'wpcontent':
			return trailingslashit(trailingslashit(WP_CONTENT_DIR).WPP_THUMBNAIL_PATH);
			break;
			
		default:
			return trailingslashit(trailingslashit(WP_PLUGIN_DIR).WPP_THUMBNAIL_PATH);
			break;
	}	
}


/**
 * Gets the full URL path for the thumbnail directory with a trailing slash.
 * @param $pathType The type of directory to fetch, or just return the one specified in the settings if false.
 * @return String The full URL for the thumbnail directory.
 */
function WPPortfolio_getThumbPathURL($pathType = false) 
{
	// If no path type is specified, then get the setting from the options table.
	if ($pathType == false) {
		$pathType = WPPortfolio_getCacheSetting();
	}
	
	switch ($pathType)
	{
		case 'wpcontent':
			return trailingslashit(trailingslashit(WP_CONTENT_URL).WPP_THUMBNAIL_PATH);
			break;
			
		default:
			return trailingslashit(trailingslashit(WP_PLUGIN_URL).WPP_THUMBNAIL_PATH);
			break;
	}
}


/**
 * Get the type of cache that we need to use. Either 'wpcontent' or 'plugin'.
 * @return String The type of cache we need to use.
 */
function WPPortfolio_getCacheSetting()
{
	$cacheSetting = get_option(WPP_CACHE_SETTING);
	
	if ($cacheSetting == 'setting_cache_wpcontent') {
		return 'wpcontent';
	}
	return 'plugin';
}


/**
 * Get the full URL path of the pending thumbnails.
 * @return String The full URL path of the pending thumbnails.
 */
function WPPortfolio_getPendingThumbURLPath() {
	return trailingslashit(WP_PLUGIN_URL).WPP_THUMB_DEFAULTS;
}






/**
 * Get the details for the specified Website ID.
 * @param $siteid The ID of the Website to get the details for.
 * @return Array An array of the Website details.
 */
function WPPortfolio_getWebsiteDetails($siteid, $dataType = ARRAY_A) 
{
	global $wpdb;
	$table_name = $wpdb->prefix . TABLE_WEBSITES;
	
	$SQL = "SELECT * FROM $table_name 
			WHERE siteid = '".$wpdb->escape($siteid)."' LIMIT 1";

	// We need to strip slashes for each entry.
	if (ARRAY_A == $dataType) {
		return WPPortfolio_cleanSlashesFromArrayData($wpdb->get_row($SQL, $dataType));
	} else {
		return $wpdb->get_row($SQL, $dataType);
	}
}



/**
 * AJAX callback function that refreshes a thumbnail.
 */
function WPPortfolio_ajax_handleForcedThumbnailRefresh() 
{
	$siteid = false;
	if (isset($_POST['siteid'])) {
		$siteid = $_POST['siteid'];
	}
	
	echo WPPortfolio_refresh_forceThumbnailRefresh($siteid);
	die();
}
add_action('wp_ajax_thumbnail_refresh', 'WPPortfolio_ajax_handleForcedThumbnailRefresh');





/**
 * Function that removes the physical cached files of the specified URL.
 * @param $fileurl The URL of the file that has been cached.
 */
function WPPortfolio_removeCachedPhotos($fileurl)
{
	$allCached = md5($fileurl).'*';
	$cacheDir = trailingslashit(WPPortfolio_getThumbPathActualDir());
	
	foreach (glob($cacheDir.$allCached) AS $filename) {
		unlink($filename);
	}
}


/**
 * Do we have a paid account?
 * @return Boolean True if we have a paid account, false otherwise.
 */
function WPPortfolio_isPaidAccount()
{
	$accountType = get_option('WPPortfolio_setting_stw_account_type');
	return ($accountType == 'paid');	
}


/**
 * Determine if there's a custom size option that's been selected.
 * @return The custom size, or false.
 */
function WPPortfolio_getCustomSizeOption()
{
	if (!WPPortfolio_isPaidAccount()) {
		return false;
    }

    // Do we want to use custom thumbnail types?
    if (get_option('WPPortfolio_setting_stw_thumb_size_type') != 'custom') {
    	return false;
    }
        
	return get_option('WPPortfolio_setting_stw_thumb_size_custom') + 0;
}


/**
 * Delete all error messages relating to this URL.
 * @param String $url The URL to purge from the error logs.
 */
function WPPortfolio_errors_removeCachedErrors($url)
{
	global $wpdb;
	$wpdb->show_errors;
				
	$table_debug = $wpdb->prefix . TABLE_WEBSITE_DEBUG;
	$SQL = $wpdb->prepare("
		DELETE FROM $table_debug
		WHERE request_url = %s
		", $url);
	
	$wpdb->query($SQL);
}


/**
 * Function checks to see if there's been an error in the last 12 hours for
 * the requested thumbnail. If there has, then return the error associated
 * with that fetch.
 * 
 * @param Array $args The arguments used to fetch the thumbnail
 * @param String $pendingThumbPath The path for images when a thumbnail cannot be loaded. 
 * @return String The URL to the error image, or false if there's no cached error.
 */
function WPPortfolio_errors_checkForCachedError($args, $pendingThumbPath)
{
	global $wpdb;
	$wpdb->show_errors;
		
	$argHash = md5(serialize($args));
		
	$table_debug    = $wpdb->prefix . TABLE_WEBSITE_DEBUG;
	$SQL = $wpdb->prepare("
		SELECT * 
		FROM $table_debug
		WHERE request_param_hash = %s
		  AND request_date > NOW() - INTERVAL 12 HOUR
		  AND request_result = 0
		ORDER BY request_date DESC
		", $argHash);
	
	$errorCache = $wpdb->get_row($SQL);
	
	if ($errorCache)  {
		return WPPortfolio_error_getErrorStatusImg($args, $pendingThumbPath, $errorCache->request_error_msg);
	}
	
	return false;
}

/**
 * Get a total count of the errors currently logged.
 */
function WPPortfolio_errors_getErrorCount()
{
	global $wpdb;
	$wpdb->show_errors;
	$table_debug    = $wpdb->prefix . TABLE_WEBSITE_DEBUG;
	
	return $wpdb->get_var("SELECT COUNT(*) FROM $table_debug WHERE request_result = 0");
}

/**
 * Adds a link to the plugin page to click through straight to the plugin page.
 */
function WPPortfolio_plugin_addSettingsLink($links) 
{ 
	$settings_link = sprintf('<a href="%s">Settings</a>', admin_url('admin.php?page=WPP_show_settings')); 
	array_unshift($links, $settings_link); 
	return $links; 
}

?>