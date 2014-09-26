<?php


/**
 * Show all the documentation in one place.
 */
function WPPortfolio_pages_showDocumentation() 
{
	?>
	<div class="wrap">
	<div id="icon-options-general" class="icon32">
	<br/>
	</div>
	
	
	<?php
	echo '<h2>'.__('WP Portfolio - Documentation', 'wp-portfolio').'</h2>';
	
	echo '<p>'.__('All the information you need to run the plugin is available on this page.', 'wp-portfolio').'</p>';	
	
	echo '<h2>'.__('Problems and Support', 'wp-portfolio').'</h2>';
	echo '<p>'.sprintf(__('Please check the <a href="%s">Frequently Asked Questions</a> page if you have any issues.', 'wp-portfolio'), 'http://wordpress.org/extend/plugins/wp-portfolio/faq/');
	printf(__(' As a last resort, please raise a problem in the <a href="%s">WP Portfolio Support Forum on Wordpress.org</a>, and I\'ll respond to the ticket as soon as possible. Please be aware, this might be a couple of days.', 'wp-portfolio'), 'http://wordpress.org/tags/wp-portfolio?forum_id=10').'</p>';
	
	echo '<h2>'.__('Comments and Feedback', 'wp-portfolio').'</h2>';
	echo '<p>'.sprintf(__('If you have any comments, ideas or any other feedback on this plugin, please leave comments on the <a href="%s">WP Portfolio Support Forum on Wordpress.org</a>.', 'wp-portfolio'), 'http://wordpress.org/tags/wp-portfolio?forum_id=10').'</p>';
		
	echo '<h2>'.__('Requesting Features', 'wp-portfolio').'</h2>';
	echo '<p>'.sprintf(__('My schedule is extremely busy, and so I have little time to add new features to this plugin. If you are keen for a feature to be implemented, I can add new features in return for a small fee which helps cover my time. Due to running an agency, so my clients are my first priority. By paying a small fee, you effectively become a client, and therefore I can implement desired features more quickly. Please contact me via the <a href="%s">WP Doctors Contact Page</a> if you would like to pay to have a new feature implemented.', 'wp-portfolio'), 'http://www.wpdoctors.co.uk/contact/');
	
	echo '<p>'.sprintf(__('You can see the list of requested features on the <a href="%s">WP Portfolio page</a> on the <a href="%s">WP Doctors</a> website. If you are prepared to wait, I do welcome feature ideas, which can be left on the <a href="%s">WP Portfolio Support Forum on Wordpress.org</a>.', 'wp-portfolio'), 'http://www.wpdoctors.co.uk/our-wordpress-plugins/wp-portfolio/', 'http://www.wpdoctors.co.uk', 'http://wordpress.org/tags/wp-portfolio?forum_id=10').'</p>';
	
	echo '<a name="doc-stw"></a>';
	echo '<h2>'.__('ShrinkTheWeb - Thumbnail Service', 'wp-portfolio').'</h2>';
	echo '<p>'.sprintf(__('The plugin requires you to have a free (or paid) account with <a href="%s" target="_blank">ShrinkTheWeb (STW)</a> if you wish to generate the thumbnails <b>dynamically</b>. Please read <a href="%s" target="_blank">the first FAQ about account types</a> to learn more. If you have a paid account with STW, this plugin will automatically handle the caching of thumbnails to give your website fast loading times.', 'wp-portfolio'), 'http://www.shrinktheweb.com', 'http://wordpress.org/extend/plugins/wp-portfolio/faq/').'</p>';

	echo '<p>'.__('However, you do not need an account with ShrinkTheWeb to use this plugin if you capture screenshots of your websites yourself. Just can capture your own screenshots as images, upload those images to your website, and then link to them in the Custom Thumbnail URL wp-portfolio</b> field.', 'wp-portfolio').'</p>';
	
	echo '<h2>'.__('Portfolio Syntax', 'wp-portfolio').'</h2>';
	echo '<p>'.__('You can use the following syntax for wp-portfolio within any post or page.', 'wp-portfolio').'</p>';
	
	echo '<h3>'.__('Individual websites', 'wp-portfolio').'</h3>';
	echo '<ul class="wp-group-syntax">';
		echo '<li>'.sprintf(__('To show just one website thumbnail, use %s. The number is the ID of the website, which can be found on the WP Portfolio summary page.', 'wp-portfolio'), '<code><b>[wp-portfolio single="1"]</b></code>').'</li>';
		echo '<li>'.sprintf(__('To show a specific selection of thumbnails, use their IDs like so: %s', 'wp-portfolio'), '<code><b>[wp-portfolio single="1,2"]</b></code>').'</li>';
	echo '</ul>';
	
	echo '<h3>'.__('Website Groups', 'wp-portfolio').'</h3>';	
	echo '<ul class="wp-group-syntax">';
		echo '<li>'.sprintf(__('To show all groups, use %s', 'wp-portfolio'), '<code><b>[wp-portfolio]</b></code>').'</li>';
		echo '<li>'.sprintf(__('To show just the group with an ID of 1, use %s', 'wp-portfolio'), '<code><b>[wp-portfolio groups="1"]</b></code>').'</li>';
		echo '<li>'.sprintf(__('To show groups with IDs of 1, 2 and 4, use %s', 'wp-portfolio'), '<code><b>[wp-portfolio groups="1,2,4"]</b></code>').'</li>';
	echo '</ul>';
	
	echo '<h3>'.__('Paging (Showing a portfolio on several pages)', 'wp-portfolio').'</h3>';	
	echo '<ul class="wp-group-syntax">';
		echo '<li>'.sprintf(__('To show all websites without any paging, just use %s as normal', 'wp-portfolio'), '<code><b>[wp-portfolio]</b></code>').'</li>';
		echo '<li>'.sprintf(__('To show 3 websites per page, use %s', 'wp-portfolio'), '<code><b>[wp-portfolio sitesperpage="3"]</b></code>').'</li>';
		echo '<li>'.sprintf(__('To show 5 websites per page, use %s', 'wp-portfolio'), '<code><b>[wp-portfolio sitesperpage="5"]</b></code>').'</li>';
	echo '</ul>';
	
	echo '<h3>'.__('Ordering By Date', 'wp-portfolio').'</h3>';
	echo '<ul class="wp-group-syntax">';
		echo '<li>'.sprintf(__('To order websites by the date they were added, showing newest first (so descending order) use %s. Group names are automatically hidden when ordering by date.'), '<code><b>[wp-portfolio ordertype="dateadded" orderby="desc"]</b></code>').'</li>';
		echo '<li>'.sprintf(__('To order websites by the date they were added, showing oldest first (so ascending order) use %s. Group names are automatically hidden when ordering by date.'), '<code><b>[wp-portfolio ordertype="dateadded" orderby="asc"]</b></code>').'</li>';
	echo '</ul>';
	
	echo '<h3>'.__('Miscellaneous Options').'</h3>';
	echo '<ul class="wp-group-syntax">';
		echo '<li>'.sprintf(__('To hide the title/description of all groups shown in a portfolio for just a single post/page without affecting other posts/pages, just use %s', 'wp-portfolio'), '<code><b>[wp-portfolio hidegroupinfo="1"]</b></code>').'</li>';
		echo '<li>'.sprintf(__('To show the portfolio in reverse order, just use %s (The <code>desc=</code> is short for descending order)'), '<code><b>[wp-portfolio orderby="desc"]</b></code>').'</li>';
	echo '</ul>';	
	
	
	echo '<h2>'.__('Uninstalling WP Portfolio').'</h2>';
	echo '<p>'.sprintf(__('If you\'re going to permanently uninstall WP Portfolio, you can also <a href="%s">remove all settings and data</a>.', 'wp-portfolio'), 'admin.php?page=WPP_show_settings&uninstall=yes').'</p>';
							
	echo '<a name="doc-layout"></a>';
	echo'<h2>'.__('Portfolio Layout Templates').'</h2>';	
	
	echo '<p>'.__('The default templates for the groups and websites below as a reference.').'</p>';
	echo '<ul style="margin-left: 30px; list-style-type: disc;">';
		echo '<li>'.sprintf('<strong>%s</strong> - '.__('Replace with the group name.', 'wp-portfolio'), WPP_STR_GROUP_NAME).'</li>';
		echo '<li>'.sprintf('<strong>%s</strong> - '.__('Replace with the group description.', 'wp-portfolio'), WPP_STR_GROUP_DESCRIPTION).'</li>';
		echo '<li>'.sprintf('<strong>%s</strong> - '.__('Replace with the website name.', 'wp-portfolio'), WPP_STR_WEBSITE_NAME).'</li>';
		echo '<li>'.sprintf('<strong>%s</strong> - '.__('Replace with the website url.', 'wp-portfolio'), WPP_STR_WEBSITE_URL).'</li>';
		echo '<li>'.sprintf('<strong>%s</strong> - '.__('Replace with the website description.', 'wp-portfolio'), WPP_STR_WEBSITE_DESCRIPTION).'</li>';
		echo '<li>'.sprintf('<strong>%s</strong> - '.__('Replace with the website thumbnail including the &lt;img&gt; tag.'), WPP_STR_WEBSITE_THUMBNAIL).'</li>';
		echo '<li>'.sprintf('<strong>%s</strong> - '.__('Replace with the website thumbnail URL (no HTML).', 'wp-portfolio'), WPP_STR_WEBSITE_THUMBNAIL_URL).'</li>';
		echo '<li>'.sprintf('<strong>%s</strong> - '.__('Replace with the custom field data.', 'wp-portfolio'), WPP_STR_WEBSITE_CUSTOM_FIELD).'</li>';
	echo '</ul>';
	?>
	
	<form>
	<table class="form-table">
		<tr class="form-field">
			<th scope="row"><label for="default_template_group"><?php _e('Group Template', 'wp-portfolio'); ?></label></th>
			<td>
				<textarea name="default_template_group" rows="3"><?php echo htmlentities(WPP_DEFAULT_GROUP_TEMPLATE); ?></textarea>
			</td>
		</tr>		
		<tr class="form-field">
			<th scope="row"><label for="default_template_website"><?php  _e('Website Template', 'wp-portfolio'); ?></label></th>
			<td>
				<textarea name="default_template_website" rows="8"><?php echo htmlentities(WPP_DEFAULT_WEBSITE_TEMPLATE); ?></textarea>
			</td>
		</tr>			
		<tr class="form-field">
			<th scope="row"><label for="default_template_css"><?php _e('Template CSS', 'wp-portfolio'); ?></label></th>
			<td>
				<textarea name="default_template_css" rows="8"><?php echo htmlentities(WPP_DEFAULT_CSS); ?></textarea>
			</td>
		</tr>					
		<tr class="form-field">
			<th scope="row"><label for="default_template_css_widget"><?php _e('Widget CSS', 'wp-portfolio'); ?></label></th>
			<td>
				<textarea name="default_template_css_widget" rows="8"><?php echo htmlentities(WPP_DEFAULT_CSS_WIDGET); ?></textarea>
			</td>
		</tr>		
	</table>
	</form>
	<p>&nbsp;</p>
	
	
	<a id="doc-paging"></a>
	<h2><?php _e('Portfolio Paging Templates', 'wp-portfolio'); ?></h2>	
	
	<?php
	echo '<p>'.__('The default templates specifically for the paging of websites (when there are more websites that you want to fit on a single page).', 'wp-portfolio').'</p>';
	echo '<ul style="margin-left: 30px; list-style-type: disc;">';
		echo '<li><strong>%PAGING_PAGE_CURRENT%</strong> - ' . __('Replace with the current page number.', 'wp-portfolio') . '</li>';
		echo '<li><strong>%PAGING_PAGE_TOTAL%</strong> - ' . __('Replace with the total number of pages.', 'wp-portfolio') . '</li>';
		echo '<li><strong>%PAGING_ITEM_START%</strong> - ' . __('Replace with the start of the range of websites/thumbnails being shown on a particular page.', 'wp-portfolio') . '</li>';
		echo '<li><strong>%PAGING_ITEM_END%</strong> - ' . __('Replace with the end of the range of websites/thumbnails being shown on a particular page.', 'wp-portfolio') . '</li>';
		echo '<li><strong>%PAGING_ITEM_TOTAL%</strong> - ' . __('Replace with the total number of websites/thumbnails in the portfolio.', 'wp-portfolio') . '</li>';
		echo '<li><strong>%LINK_PREVIOUS%</strong> - ' . __('Replace with the link to the previous page.', 'wp-portfolio') . '</li>';
		echo '<li><strong>%LINK_NEXT%</strong> - ' . __('Replace with the link to the next page.', 'wp-portfolio') . '</li>';
		echo '<li><strong>%PAGE_NUMBERS%</strong> - ' . __('Replace with the list of pages, with each number being a link.', 'wp-portfolio') . '</li>';
	echo '</ul>';
	?>
	
	<form>
	<table class="form-table">
		<tr class="form-field">
			<th scope="row"><label for="default_template_paging"><?php _e('Paging Template', 'wp-portfolio'); ?></label></th>
			<td>
				<textarea name="default_template_group" rows="3"><?php echo htmlentities(WPP_DEFAULT_PAGING_TEMPLATE); ?></textarea>
			</td>
		</tr>		
		<tr class="form-field">
			<th scope="row"><label for="default_template_css_paging"><?php _e('Paging CSS', 'wp-portfolio'); ?></label></th>
			<td>
				<textarea name="default_template_css_paging" rows="8"><?php echo htmlentities(WPP_DEFAULT_CSS_PAGING); ?></textarea>
			</td>
		</tr>		
	</table>
	</form>
	<p>&nbsp;</p>
		
	<h2><?php _e('Showing the Portfolio from PHP', 'wp-portfolio'); ?></h2>
	<h3>WPPortfolio_getAllPortfolioAsHTML()</h3>
	<p><?php _e(sprintf('You can show all or a part of the portfolio from within code by using the %s function.', '<code>WPPortfolio_getAllPortfolioAsHTML($groups, $template_website, $template_group, $sitesperpage, $showAscending, $orderBy)</code>'), 'wp-portfolio' ); ?></p>
	
	<p><b><?php _e('Parameters', 'wp-portfolio'); ?></b></p>
	<ul class="wp-group-syntax">
	<?php 
		echo '<li><b>$groups</b> - '.				sprintf(__('The comma separated list of groups to include. To show all groups, specify %1$s for %2$s. (<b>default</b> is %1$s)', 'wp-portfolio'), '<code>false</code>', '<code>$groups</code>').'</li>';
		echo '<li><b>$template_website</b> - ' . 	sprintf(__('The HTML template to use for rendering a single website (using the <a href="%1$s#doc-layout">template tags above</a>). Specify %2$s to use the website template stored in the settings. (<b>default</b> is %2$s, i.e. use template stored in settings.)', 'wp-portfolio'), WPP_DOCUMENTATION, '<code>false</code>').'</li>';
		echo '<li><b>$template_group</b> - ' . 		sprintf(__('The HTML template to use for rendering a group description (using the <a href="%1$s#doc-layout">template tags above</a>). Specify %2$s to use the group template stored in the settings. To hide the group description, specify a single space character for %3$s. (<b>default</b> is %2$s, i.e. use template stored in settings.)', 'wp-portfolio'), WPP_DOCUMENTATION, '<code>false</code>', '<code>$template_group</code>').'</li>';
		echo '<li><b>$sitesperpage</b> - ' . 		sprintf(__('The number of websites to show per page, set to %1$s or %2$s if you don\'t want to use paging.  (<b>default</b> is %1$s, i.e. don\'t do any paging.)', 'wp-portfolio'), '<code>false</code>', '<code>0</code>').'</li>';
		echo '<li><b>$showAscending</b> - ' . 		sprintf(__('If %1$s, show the websites in ascending order. If %2$s, show the websites in reverse order. (<b>default</b> is %1$s, i.e. ascending ordering.)', 'wp-portfolio'), '<code>true</code>', '<code>false</code>').'</li>';
		echo '<li><b>$orderBy</b> - ' . 			sprintf(__('Determine how to order the websites. (<b>default</b> is %s, i.e. normal ordering.)', 'wp-portfolio'), '<code>\'normal\'</code>');
		echo '<ul>';
			echo '<li>' . 								sprintf(__('If %s, show the websites in normal group order.', 'wp-portfolio'), '<code>\'normal\'</code>').'</li>';
			echo '<li>' . 								sprintf(__('If %s, show the websites ordered by date. If this mode is chosen, group names are automatically hidden.', 'wp-portfolio'), '<code>\'dateadded\'</code>').'</li>';
		echo '</ul>';
		echo '</li>';
		?>
	</ul>	
	
	<p>&nbsp;</p>	
	
	<p><b><?php _e('Example 1 (using website template stored in settings)', 'wp-portfolio'); ?>:</b></p> 	
	<pre>
&lt;?php 
if (function_exists('WPPortfolio_getAllPortfolioAsHTML')) {
	echo WPPortfolio_getAllPortfolioAsHTML('1,3');
}
?&gt;
	</pre>
	
	<p><b><?php _e('Example 2 (with custom templates)', 'wp-portfolio'); ?>:</b></p>
	<pre>
&lt;?php 
if (function_exists('WPPortfolio_getAllPortfolioAsHTML'))
{
	$website_template = '
		&lt;div class=&quot;portfolio-website&quot;&gt;
		&lt;div class=&quot;website-thumbnail&quot;&gt;&lt;a href=&quot;%WEBSITE_URL%&quot; target=&quot;_blank&quot;&gt;%WEBSITE_THUMBNAIL%&lt;/a&gt;&lt;/div&gt;
		&lt;div class=&quot;website-name&quot;&gt;&lt;a href=&quot;%WEBSITE_URL%&quot; target=&quot;_blank&quot;&gt;%WEBSITE_NAME%&lt;/a&gt;&lt;/div&gt;
		&lt;div class=&quot;website-description&quot;&gt;%WEBSITE_DESCRIPTION%&lt;/div&gt;
		&lt;div class=&quot;website-clear&quot;&gt;&lt;/div&gt;
		&lt;/div&gt;';
		
	$group_template = '
		&lt;h2&gt;%GROUP_NAME%&lt;/h2&gt;
		&lt;p&gt;%GROUP_DESCRIPTION%&lt;/p&gt;';	
	
	echo WPPortfolio_getAllPortfolioAsHTML('1,2', $website_template, $group_template);
}
?&gt;
	</pre>		
	
	<p><b><?php _e('Example 3 (using stored templates, but showing 3 websites per page)', 'wp-portfolio'); ?>:</b></p> 	
	<pre>
&lt;?php 
if (function_exists('WPPortfolio_getAllPortfolioAsHTML')) {
	echo WPPortfolio_getAllPortfolioAsHTML('1,3', false, false, '3');
}
?&gt;
	</pre>	
	
	<p><b><?php _e('Example 4 (using stored templates, but showing 4 websites per page, ordering by date, with the newest website first)', 'wp-portfolio'); ?>:</b></p> 	
	<pre>
&lt;?php 
if (function_exists('WPPortfolio_getAllPortfolioAsHTML')) {
	echo WPPortfolio_getAllPortfolioAsHTML('1,3', false, false, '3', false, 'dateadded');
}
?&gt;
	</pre>	
			
		
	<p>&nbsp;</p>		
	
	<h3>WPPortfolio_getRandomPortfolioSelectionAsHTML()</h3>
	<p><?php echo sprintf(__('You can show a random selection of your portfolio from within code by using the %s function. Please note that there is no group information shown when this function is used.', 'wp-portfolio'), '<code>WPPortfolio_getRandomPortfolioSelectionAsHTML($groups, $count, $template_website)</code>'); ?></p>
	
	<p><b><?php echo _e('Parameters', 'wp-portfolio'); ?></b></p>
	<ul class="wp-group-syntax">
		<li><b>$groups</b> - <?php echo sprintf(__('The comma separated list of groups to make a random selection from. To choose from all groups, specify %1$s for %2$s (<b>default</b> is %1$s).', 'wp-portfolio'), '<code>false</code>', '<code>$groups</code>'); ?></li>
		<li><b>$count</b> - <?php echo sprintf(__('The number of websites to show in the random selection. (<b>default</b> is %s)'), '<code>3</code>'); ?></li>
		<li><b>$template_website</b> - <?php echo sprintf(__('The HTML template to use for rendering a single website (using the <a href="%1$s#doc-layout">template tags above</a>). Specify %2$s to use the website template stored in the settings. (<b>default</b> is %2$s, i.e. use template stored in settings.)', 'wp-portfolio'), WPP_DOCUMENTATION, '<code>false</code>'); ?></li>
	</ul>
	
	<p>&nbsp;</p>	
	
	<p><b><?php _e('Example 1 (using website template stored in settings)', 'wp-portfolio'); ?>:</b></p>
	<pre>
&lt;?php 
if (function_exists('WPPortfolio_getRandomPortfolioSelectionAsHTML')) {
	echo WPPortfolio_getRandomPortfolioSelectionAsHTML('1,4', 4);
}
?&gt;
	</pre>
	
	<p><b><?php _e('Example 2 (with custom templates)', 'wp-portfolio'); ?>:</b></p>
	<pre>
&lt;?php 
if (function_exists('WPPortfolio_getRandomPortfolioSelectionAsHTML')) {
	$website_template = '
		&lt;div class=&quot;portfolio-website&quot;&gt;
		&lt;div class=&quot;website-thumbnail&quot;&gt;&lt;a href=&quot;%WEBSITE_URL%&quot; target=&quot;_blank&quot;&gt;%WEBSITE_THUMBNAIL%&lt;/a&gt;&lt;/div&gt;
		&lt;div class=&quot;website-name&quot;&gt;&lt;a href=&quot;%WEBSITE_URL%&quot; target=&quot;_blank&quot;&gt;%WEBSITE_NAME%&lt;/a&gt;&lt;/div&gt;
		&lt;div class=&quot;website-clear&quot;&gt;&lt;/div&gt;
		&lt;/div&gt;';
	echo WPPortfolio_getRandomPortfolioSelectionAsHTML('1,4', 4, $website_template);
}
?&gt;
	</pre>
		

	<p>&nbsp;</p>	
	
	
	<p>&nbsp;</p>
</div>
	
	<?php
}



/**
 * Shows either information or error message.
 */
function WPPortfolio_showMessage($message = false, $errormsg = false)
{
	if (!$message) {
		$message = __("Settings saved.", 'wp-portfolio');
	}
	
	if ($errormsg) {
		echo '<div id="message" class="error">';
	}
	else {
		echo '<div id="message" class="updated fade">';
	}

	echo "<p><strong>$message</strong></p></div>";
}



/**
 * Function: WPPortfolio_showRedirectionMessage();
 *
 * Shows settings saved and page being redirected message.
 */
function WPPortfolio_showRedirectionMessage($message, $target, $delay)
{
?>
	<div id="message" class="updated fade">
		<p>
			<strong><?php echo $message; ?><br /><br />
			<?php echo sprintf(__('Redirecting in %1$s seconds. Please click <a href="%2$s">here</a> if you do not wish to wait.', 'wp-portfolio'), $delay, $target); ?>
			</strong>
		</p>
	</div>
	
	<script type="text/javascript">
    <!--
            function getgoing() {
                     top.location="<?php echo $target; ?>";
            }

            if (top.frames.length==0) {
                setTimeout('getgoing()',<?php echo $delay * 1000 ?>);
            }
	//-->
	</script>
	<?php
}


/**
 * Show the main settings page.
 */
function WPPortfolio_pages_showSettings()
{	
?>
	<div class="wrap">
	<div id="icon-options-general" class="icon32">
	<br/>
	</div>
	<h2>WP Portfolio - <?php _e('General Settings'); ?></h2>
<?php 	

	$settingsList = WPPortfolio_getSettingList(true, false);
	
	// Get all the options from the database for the form
	$settings = array();
	foreach ($settingsList as $settingName => $settingDefault) {
		$settings[$settingName] = stripslashes(get_option('WPPortfolio_'.$settingName)); 
	}
		
	// If we don't have the version in the settings, we're not installed
	if (!get_option('WPPortfolio_version')) {
		WPPortfolio_showMessage(sprintf(__('No %s settings were found, so it appears that the plugin has been uninstalled. Please <b>deactivate</b> and then <b>activate</b> the %s plugin again to fix this.', 'wp-portfolio'), 'WP Portfolio', 'WP Portfolio'), true);
		return false;
	}
	
	// #### UNINSTALL - Uninstall plugin?
	if (WPPortfolio_getArrayValue($_GET, 'uninstall') == "yes")
	{
		if ($_GET['confirm'] == "yes") {
			WPPortfolio_uninstall();
		}
		else {
			WPPortfolio_showMessage(sprintf(__('Are you sure you want to delete all %s settings and data? This action cannot be undone!', 'wp-portfolio'), 'WP Portfolio') .'</strong><br/><br/><a href="'.WPP_SETTINGS.'&uninstall=yes&confirm=yes">' . __('Yes, delete.', 'wp-portfolio') . '</a> &nbsp; <a href="'.WPP_SETTINGS.'">' . __('NO!', 'wp-portfolio') . '</a>');
		}
		return false;
	} // end if ($_GET['uninstall'] == "yes")		
		
	
	// #### SETTINGS - Check if updated data.
	else if (WPPortfolio_getArrayValue($_POST, 'update') == 'general-settings')
	{
		// Copy settings from $_POST
		$settings = array();
		foreach ($settingsList as $settingName => $settingDefault) 
		{
			$settings[$settingName] = WPPortfolio_getArrayValue($_POST, $settingName);			 			
		}		
		
		// Validate keys
		if (WPPortfolio_isValidKey($settings['setting_stw_access_key']) && 
			WPPortfolio_isValidKey($settings['setting_stw_secret_key']))
		{		
			// Save settings
			foreach ($settingsList as $settingName => $settingDefault) {
				update_option('WPPortfolio_'.$settingName, $settings[$settingName]); 
			}
								
			WPPortfolio_showMessage();		
		}
		else {
			WPPortfolio_showMessage(__('The keys must only contain letters and numbers. Please check that they are correct.', 'wp-portfolio'), true);
		}
	}	

	// #### Table UPGRADE - Check if forced table upgrade
	else if (WPPortfolio_getArrayValue($_POST, 'update') == 'tables_force_upgrade')
	{
		WPPortfolio_showMessage(__('Upgrading WP Portfolio Tables...', 'wp-portfolio'));
		flush();		
		WPPortfolio_install_upgradeTables(true, false, false);
		WPPortfolio_showMessage(sprintf(__('%s tables have successfully been upgraded.', 'wp-portfolio'), 'WP Portfolio') );
	}
	
	// #### CODEPAGE UPGRADE - Check if upgrading codepage
	else if (WPPortfolio_getArrayValue($_POST, 'update') == 'codepage_upgrade')
	{
		// Handle the codepage upgrades from default MySQL latin1_swedish_ci to utf8_general_ci to help deal with 
		// other languages
		global $wpdb;
		$wpdb->show_errors;
		
		// Table names
		$table_websites	= $wpdb->prefix . TABLE_WEBSITES;
		$table_groups 	= $wpdb->prefix . TABLE_WEBSITE_GROUPS;
		$table_debug    = $wpdb->prefix . TABLE_WEBSITE_DEBUG;
		
		
		// Website
		$wpdb->query("ALTER TABLE `$table_websites` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci");
		$wpdb->query("ALTER TABLE `$table_websites` CHANGE `sitename` 	     `sitename`    	    VARCHAR( 150 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL");
		$wpdb->query("ALTER TABLE `$table_websites` CHANGE `siteurl` 		 `siteurl` 			VARCHAR( 255 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL");
		$wpdb->query("ALTER TABLE `$table_websites` CHANGE `sitedescription` `sitedescription`  TEXT 		   CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL");
		$wpdb->query("ALTER TABLE `$table_websites` CHANGE `customthumb` 	 `customthumb` 		VARCHAR( 255 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL");
	
		// Groups
		$wpdb->query("ALTER TABLE `$table_groups` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci");
		$wpdb->query("ALTER TABLE `$table_groups` CHANGE `groupname` 	    `groupname`    	   VARCHAR( 150 )  CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL");
		$wpdb->query("ALTER TABLE `$table_groups` CHANGE `groupdescription` `groupdescription` TEXT 		   CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL");
		
		// Debug Log
		$wpdb->query("ALTER TABLE `$table_debug` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci");
		$wpdb->query("ALTER TABLE `$table_debug` CHANGE `request_url` 	 `request_url`    VARCHAR( 255 ) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL");
		$wpdb->query("ALTER TABLE `$table_debug` CHANGE `request_detail` `request_detail` TEXT 		     CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL");
		$wpdb->query("ALTER TABLE `$table_debug` CHANGE `request_type`   `request_type`   VARCHAR( 25 )  CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL");
	
		WPPortfolio_showMessage(sprintf(__('%s tables have successfully been upgraded to UTF-8.', 'wp-portfolio'), 'WP Portfolio') );
	}
	
	
	// #### CACHE - Check if changing location 
	else if (WPPortfolio_getArrayValue($_POST, 'update') == 'change_cache_location') 
	{		
		$oldCacheLoc = get_option(WPP_CACHE_SETTING);		
		$newCacheLoc = WPPortfolio_getArrayValue($_POST, 'new_cache_location');

		// Check that we've changed something
		if ($newCacheLoc && $newCacheLoc != $oldCacheLoc)
		{
			// Update the options setting 
			update_option(WPP_CACHE_SETTING, $newCacheLoc);
			
			$newLoc = WPPortfolio_getCacheSetting();
			$oldLoc = ($newLoc == 'wpcontent' ? 'plugin' : 'wpcontent'); 
			
			// Get the full directory paths we need to manipluate the cache files
			$newDirPath = WPPortfolio_getThumbPathActualDir($newLoc);
			$oldDirPath = WPPortfolio_getThumbPathActualDir($oldLoc);
			$newURLPath = WPPortfolio_getThumbPathActualDir($newLoc);
			
			// Create new cache directory
			WPPortfolio_createCacheDirectory($newLoc);
						
			// Copy the files...
			WPPortfolio_fileCopyRecursive($oldDirPath, $newDirPath);
			
			// Remove the old files
			WPPortfolio_unlinkRecursive($oldDirPath, false);
					
			WPPortfolio_showMessage(sprintf(__('The cache location has successfully been changed. The new cache location is now:<br/><br/><code>%s</code>', 'wp-portfolio'), $newURLPath));
		}
		
		// Old and new are the same.
		else {
			WPPortfolio_showMessage(__('The cache location has not changed, therefore there is nothing to do.', 'wp-portfolio'));
		}
	}
	
	
	$form = new FormBuilder('general-settings');
	
	$formElem = new FormElement("setting_stw_access_key", __('STW Access Key ID', 'wp-portfolio'));
	$formElem->value = $settings['setting_stw_access_key'];
	$formElem->description = sprintf(__('The <a href="%s#doc-stw">Shrink The Web</a> Access Key ID is around 15 characters.', 'wp-portfolio'), WPP_DOCUMENTATION);
	$form->addFormElement($formElem);
	
	$formElem = new FormElement("setting_stw_secret_key", __('STW Secret Key', 'wp-portfolio'));
	$formElem->value = $settings['setting_stw_secret_key'];
	$formElem->description = sprintf(__('The <a href="%s#doc-stw">Shrink The Web</a> Secret Key is around 5-10 characters. This key is never shared, it is only stored in your settings and used to generate thumbnails for this website.', 
		'wp-portfolio'), WPP_DOCUMENTATION)."<a name=\"stw-account\"></a>"; // The anchor for the option below
	$form->addFormElement($formElem);
	
	
	$formElem = new FormElement("setting_stw_account_type", __("STW Account Type", 'wp-portfolio'));
	$formElem->value = $settings['setting_stw_account_type'];
	$formElem->setTypeAsComboBox(array('' => __('-- Select an account type --', 'wp-portfolio'), 'free' => __('Free Account', 'wp-portfolio'), 'paid' => __('Paid (Basic or Plus) Account', 'wp-portfolio')));
	$formElem->description = sprintf('&bull; '.__('The type of account you have with <a href="%s#doc-stw">Shrink The Web</a>. ', 'wp-portfolio'), WPP_DOCUMENTATION).
							__('Either a <i>free account</i>, or a <i>paid (basic or plus) account</i>. Your account type determines how the portfolio works.', 'wp-portfolio').'<br/>'.
						 	sprintf('&bull; '.__('Learn more about account types in the <a href="%s" target="_new"> FAQ section.</a>', 'wp-portfolio'), 'http://wordpress.org/extend/plugins/wp-portfolio/faq/');
	$form->addFormElement($formElem);
	
	$form->addBreak('wpp-thumbnails', '<div class="wpp-settings-div">' . __('Thumbnail Settings', 'wp-portfolio') . '</div>');
	
	
	// Thumbnail sizes - Paid Only
	if (WPPortfolio_isPaidAccount())
	{
		$formElem = new FormElement("setting_stw_thumb_size_type", __('What thumbnail sizes do you want to use?', 'wp-portfolio'));
		$formElem->value = $settings['setting_stw_thumb_size_type'];
		$formElem->setTypeAsComboBox(array('standard' => __('Standard STW Sizes', 'wp-portfolio'), 'custom' => __('My own custom sizes', 'wp-portfolio')));
		$formElem->cssclass = 'wpp-size-type';
		$form->addFormElement($formElem);
		
		$formElem = new FormElement("setting_stw_thumb_size_custom", __('Custom Thumbnail Size (Width)', 'wp-portfolio'));
		$formElem->value = $settings['setting_stw_thumb_size_custom'];
		$formElem->cssclass = 'wpp-size-custom';
		$formElem->description = '&bull; '.__('Specify your desired width for the custom thumbnail. STW will resize the thumbnail to be in a 4:3 ratio.', 'wp-portfolio').'<br/>'.
								 '&bull; '.__('This feature requires a STW Paid (Basic or Plus) account with custom thumbnail support.', 'wp-portfolio');
		$formElem->afterFormElementHTML = '<div class="wpp-size-custom-other"></div>';
		$form->addFormElement($formElem);
	}
	
	// Thumbnail sizes - Basic	
	$thumbsizes = array ("sm" => __('Small (120 x 90)', 'wp-portfolio'),
						 "lg" => __('Large (200 x 150)', 'wp-portfolio'),
						 "xlg" => __('Extra Large (320 x 240)', 'wp-portfolio'));
	
	$formElem = new FormElement("setting_stw_thumb_size", __('Thumbnail Size', 'wp-portfolio'));
	$formElem->value = $settings['setting_stw_thumb_size'];
	$formElem->setTypeAsComboBox($thumbsizes);
	$formElem->cssclass = 'wpp-size-select';
	$form->addFormElement($formElem);		
	
	

	
	// Cache days
	$cachedays = array ( "3" => "3 " . __('days', 'wp-portfolio'),
						 "5" => "5 " . __('days', 'wp-portfolio'),
						 "7" => "7 " . __('days', 'wp-portfolio'),
						 "10" => "10 " . __('days', 'wp-portfolio'),
						 "15" => "15 " . __('days', 'wp-portfolio'),
						 "20" => "20 " . __('days', 'wp-portfolio'),
						 "30" => "30 " . __('days', 'wp-portfolio'),
						 "0" => __('Never Expire Thumbnails', 'wp-portfolio'),
						);
	
	$formElem = new FormElement("setting_cache_days", __('Number of Days to Cache Thumbnail', 'wp-portfolio'));
	$formElem->value = $settings['setting_cache_days'];
	$formElem->setTypeAsComboBox($cachedays);
	$formElem->description = __('The number of days to hold thumbnails in the cache. Set to a longer time period if website homepages don\'t change very often', 'wp-portfolio');
	$form->addFormElement($formElem);	
	
	// Thumbnail Fetch Method
	$fetchmethod = array( "curl" => __('cURL (recommended)', 'wp-portfolio'),
						  "fopen" => __("fopen", 'wp-portfolio'));
	
	$formElem = new FormElement("setting_fetch_method", __('Thumbnail Fetch Method', 'wp-portfolio'));
	$formElem->value = $settings['setting_fetch_method'];
	$formElem->setTypeAsComboBox($fetchmethod);
	$formElem->description = __('The type of HTTP call used to fetch thumbnails. fopen is usually less secure and disabled by most web hosts, hence why cURL is recommended.', 'wp-portfolio');
	$form->addFormElement($formElem);		
	
	// Custom Thumbnail Scale Method
	$scalemethod = array( "scale-height" => __('Match height of website thumbnails', 'wp-portfolio'),
						  "scale-width" => __('Match width of website thumbnails', 'wp-portfolio'),
						  "scale-both" => __('Ensure thumbnail is same size or smaller than website thumbnails (default)', 'wp-portfolio') );
	
	$formElem = new FormElement("setting_scale_type", __('Custom Thumbnail Scale Method', 'wp-portfolio'));
	$formElem->value = $settings['setting_scale_type'];
	$formElem->setTypeAsComboBox($scalemethod);

	$formElem->description = __('How custom thumbnails are scaled to match the size of other website thumbnails. This is mostly a matter of style. The thumbnails can match either:', 'wp-portfolio').
							'<br/>&nbsp;&nbsp;&nbsp;&nbsp;'.__('a) <strong>the height</strong> of the website thumbnails (with the width resized to keep the scale of the original image)', 'wp-portfolio').
							'<br/>&nbsp;&nbsp;&nbsp;&nbsp;'.__('b) <strong>the width</strong> of the website thumbnails  (with the height resized to keep the scale of the original image)', 'wp-portfolio').
							'<br/>&nbsp;&nbsp;&nbsp;&nbsp;'.__('c) <strong>the width and the height</strong> of the website thumbnails, where the custom thumbnail is never larger than a website thumbnail, but still scaled correctly.', 'wp-portfolio').
							'<br/>'.__('After changing this option, it\'s recommended to clear the cache so that all custom thumbnails are sized correctly.', 'wp-portfolio');
	$form->addFormElement($formElem);
	
	
	$form->addBreak('wpp-thumbnails', '<div class="wpp-settings-div">' . __('Miscellaneous Settings', 'wp-portfolio') . '</div>');
	
	// Debug mode
	$formElem = new FormElement("setting_enable_debug", __('Enable Debug Mode', 'wp-portfolio'));
	$formElem->value = $settings['setting_enable_debug'];
	$formElem->setTypeAsCheckbox("Enable debug logging");
	$formElem->description = __('Enables logging of successful thumbnail requests too (all errors are logged regardless).', 'wp-portfolio');
	$form->addFormElement($formElem);		
	
	// Show credit link
	$formElem = new FormElement("setting_show_credit", __('Show Credit Link', 'wp-portfolio'));
	$formElem->value = $settings['setting_show_credit'];
	$formElem->setTypeAsCheckbox(__('Creates a link back to WP Portfolio and to WPDoctors.co.uk', 'wp-portfolio'));
	$formElem->description = __("<strong>I've worked hard on this plugin, please consider keeping the link back to my website!</strong> It's the link back to my site that keeps this plugin free!", 'wp-portfolio');
	$form->addFormElement($formElem);	
			
	echo $form->toString();
	?>
	
	<p>&nbsp;</p><p>&nbsp;</p>
	<h2><?php _e("Server Compatibility Checker", "wp-portfolio");?></h2>	
	<table id="wpp-checklist">
		<tbody>
			<tr>
				<td><?php _e("PHP Version", "wp-portfolio");?></td>
				<td><?php echo phpversion(); ?></td>
				<td>
					<?php if(version_compare(phpversion(), '5.0.0', '>')) : ?>
						<img src="<?php echo WPPortfolio_getPluginPath(); ?>/imgs/icon_tick.png" alt="Yes" />

                    <?php else : ?>        
						<img src="<?php echo WPPortfolio_getPluginPath(); ?>/imgs/icon_stop.png" alt="No" />
						<span class="wpp-error-info"><?php echo __('WP Portfolio requires PHP 5 or above.', 'wp-portfolio'); ?></span>
					<?php endif; ?>
				</td>
			</tr>	
			
			<tr>
				<?php 					
					// Check for cache path
					$cachePath = WPPortfolio_getThumbPathActualDir(); 
					$isWriteable = (file_exists($cachePath) && is_dir($cachePath) && is_writable($cachePath));
				?>
				<td><?php _e("Writeable Cache Folder", "wp-portfolio");?></td>
				<?php if ($isWriteable) : ?>
					<td><?php _e('Yes'); ?></td>
					<td>					
						<img src="<?php echo WPPortfolio_getPluginPath(); ?>/imgs/icon_tick.png" alt="Yes" />
					</td>
				<?php else : ?>
					<td><?php _e('No'); ?></td>
					<td>        
						<img src="<?php echo WPPortfolio_getPluginPath(); ?>/imgs/icon_stop.png" alt="No" />
						<span class="wpp-error-info"><?php echo __('WP Portfolio requires a directory for the cache that\'s writeable.', 'wp-portfolio'); ?></span>
					</td>
				<?php endif; ?>
			</tr>	
			
			<tr>
				<?php 
					// Check for open_basedir restriction
					$openBaseDirSet = ini_get('open_basedir');
				?>
				<td><?php echo __("open_basedir Restriction", "wp-portfolio");?></td>
				<?php if (!$openBaseDirSet) : ?>
					<td><?php _e('Not Set'); ?></td>
					<td>					
						<img src="<?php echo WPPortfolio_getPluginPath(); ?>/imgs/icon_tick.png" alt="Yes" />
					</td>
				<?php else : ?>
					<td><?php _e('Set'); ?></td>
					<td>        
						<img src="<?php echo WPPortfolio_getPluginPath(); ?>/imgs/icon_stop.png" alt="No" />
						<span class="wpp-error-info"><?php _e("The PHP ini open_basedir setting can cause problems with fetching thumbnails.", "wp-portfolio"); ?></span>
					</td>
				<?php endif; ?>
			</tr>
						
		</tbody>
	</table>
	
	
	
	<p>&nbsp;</p><p>&nbsp;</p>
	<h2><?php _e("Change Cache Location", "wp-portfolio"); ?></h2>
	<p><?php echo __('You can either have the thumbnail cache stored in the <b>plugin directory</b> (which gets deleted when you upgrade the plugin), or you can have the thumbnail cache stored in the <b>wp-content directory</b> (which doesn\'t get deleted when you upgrade wp-portfolio). This is only useful if your thumbnails are set to never be updated and you don\'t want to lose the cached thumbnails.', 'wp-portfolio'); ?></p>
	<dl>
		<dt><?php _e('Plugin Location', 'wp-portfolio'); ?>: <?php if (WPPortfolio_getCacheSetting() == 'plugin') { printf('&nbsp;&nbsp;<i class="wpp-cache-selected">(%s)</i>', __('Currently Selected', 'wp-portfolio')); } ?></dt>
		<dd><code><?php echo WPPortfolio_getThumbPathURL('plugin'); ?></code></dd>	
		
		<dt><?php echo 'wp-content'.__(' Location', 'wp-portfolio'); ?>: <?php if (WPPortfolio_getCacheSetting() == 'wpcontent') { printf('&nbsp;&nbsp;<i class="wpp-cache-selected">(%s)</i>', __('Currently Selected', 'wp-portfolio')); } ?></dt>
		<dd><code><?php echo WPPortfolio_getThumbPathURL('wpcontent'); ?></code></dd>
	</dl>
	
	<?php
	$form = new FormBuilder('change_cache_location');
	
	// List of Cache Locations
	$cacheLocations = array('setting_cache_plugin' => __('Plugin Directory (Recommended)', 'wp-portfolio'), 
							'setting_cache_wpcontent' => __('wp-content Directory', 'wp-portfolio')
						);
	
	$formElem = new FormElement('new_cache_location', __('New Cache Location', 'wp-portfolio'));
	$formElem->setTypeAsComboBox($cacheLocations);
	$form->addFormElement($formElem);
	
	// Set the default location based on current setting.
	$form->setDefaultValues(array('new_cache_location' => get_option(WPP_CACHE_SETTING, true)));
	
	$form->setSubmitLabel(__('Change Cache Location', 'wp-portfolio'));	
	echo $form->toString();
	?>
	
	
	<p>&nbsp;</p>
	<hr>
	
	<h2><?php _e("Upgrade Tables", "wp-portfolio"); ?></h2>
	<p><?php echo __("<p>If you're getting any errors relating to tables, you can force an upgrade of the database tables relating to WP Portfolio.", 'wp-portfolio'); ?></p>
	<?php
	$form = new FormBuilder('tables_force_upgrade');
	$form->setSubmitLabel(__('Force Table Upgrade', 'wp-portfolio'));	
	echo $form->toString();
	?>
	
	<hr>
	
	<h2><?php _e("Upgrade Tables to UTF-8 Codepage (Advanced)", "wp-portfolio"); ?></h2>
	<p><?php echo __('As of V1.18, WP Portfolio uses UTF-8 as the default codepage for all text fields. Previously, for non Latin-based languages, the lack of UTF-8 support caused rendering issues with characters (such as using question marks and blocks for certain characters).', 'wp-portfolio');
			echo __('To upgrade to the new UTF-8 support, just click the button below. If you\'re <b>not experiencing problems</b> with website names and descriptions, then there\'s no need to click this button.</p>', 'wp-portfolio'); ?>
	<?php
	$form = new FormBuilder('codepage_upgrade');
	$form->setSubmitLabel(__('Upgrade Codepage to UTF-8', 'wp-portfolio'));	
	echo $form->toString();
	?>
		
		
		
	<hr>
	<h2><?php _e('Uninstalling WP Portfolio', 'wp-portfolio'); ?></h2>
	<p><?php echo sprintf(__('If you\'re going to permanently uninstall WP Portfolio, you can also <a href="%s">remove all settings and data</a>.</p>', 'wp-portfolio'), 'admin.php?page=WPP_show_settings&uninstall=yes'); ?>
		
	<p>&nbsp;</p>	
	<p>&nbsp;</p>
	</div>
	<?php 	
}


/**
 * Show only the settings relating to layout of the portfolio.
 */
function WPPortfolio_pages_showLayoutSettings() 
{
?>
	<div class="wrap">
	<div id="icon-themes" class="icon32">
	<br/>
	</div>
	<h2>WP Portfolio - Layout Settings</h2>
<?php 	

	// Get all the options from the database
	$settingsList = WPPortfolio_getSettingList(false, true);
	
	// Get all the options from the database for the form
	$settings = array();
	foreach ($settingsList as $settingName => $settingDefault) {
		$settings[$settingName] = stripslashes(get_option('WPPortfolio_'.$settingName));
	}	
		
	// If we don't have the version in the settings, we're not installed
	if (!get_option('WPPortfolio_version')) {
		WPPortfolio_showMessage(__('No WP Portfolio settings were found, so it appears that the plugin has been uninstalled. Please <b>deactivate</b> and then <b>activate</b> the WP Portfolio plugin again to fix this.', 'wp-portfolio'), true);
		return false;
	}
	
			
	// Check if updated data.
	if ( isset($_POST) && isset($_POST['update']) )
	{
		// Copy settings from $_POST
		$settings = array();
		foreach ($settingsList as $settingName => $settingDefault) 
		{
			$settings[$settingName] = stripslashes(trim(WPPortfolio_getArrayValue($_POST, $settingName)));			 			
		}		

		// Save settings
		foreach ($settingsList as $settingName => $settingDefault) {
			update_option('WPPortfolio_'.$settingName, $settings[$settingName]); 
		}
							
		WPPortfolio_showMessage();				
	}	
	
	
	$form = new FormBuilder();	
	
	$formElem = new FormElement("setting_template_website", __("Website HTML Template", 'wp-portfolio'));				
	$formElem->value = htmlentities($settings['setting_template_website']);
	$formElem->description = '&bull; '.__('This is the template used to render each of the websites.', 'wp-portfolio').'<br/>'.
							sprintf('&bull; '.__('A complete list of tags is available in the <a href="%s#doc-layout">Portfolio Layout Templates</a> section in the documentation.', 'wp-portfolio'), WPP_DOCUMENTATION);
	$formElem->setTypeAsTextArea(8, 70); 
	$form->addFormElement($formElem);
	
	$formElem = new FormElement("setting_template_group", __("Group HTML Template", 'wp-portfolio'));				
	$formElem->value = htmlentities($settings['setting_template_group']);
	$formElem->description = '&bull; '.__('This is the template used to render each of the groups that the websites belong to.', 'wp-portfolio').'<br/>'.
							sprintf('&bull; '.__('A complete list of tags is available in the <a href="%s#doc-layout">Portfolio Layout Templates</a> section in the documentation.', 'wp-portfolio'), WPP_DOCUMENTATION);
	$formElem->setTypeAsTextArea(3, 70); 
	$form->addFormElement($formElem);	
	
	
	$form->addBreak('settings_paging', '<div class="settings-spacer">&nbsp;</div><h2>'.__('Portfolio Paging Settings', 'wp-portfolio') . '</h2>');
	$formElem = new FormElement("setting_template_paging", __("Paging HTML Template", 'wp-portfolio'));				
	$formElem->value = htmlentities($settings['setting_template_paging']);
	$formElem->description = '&bull; '.__('This is the template used to render the paging for the thumbnails.', 'wp-portfolio').'<br/>'.
							sprintf('&bull; '.__('A complete list of tags is available in the <a href="%s#doc-paging">Portfolio Paging Templates</a> section in the documentation.', 'wp-portfolio'), WPP_DOCUMENTATION);
	$formElem->setTypeAsTextArea(3, 70); 
	$form->addFormElement($formElem);	
	
	$formElem = new FormElement("setting_template_paging_previous", __("Text for 'Previous' link", 'wp-portfolio'));				
	$formElem->value = htmlentities($settings['setting_template_paging_previous']);
	$formElem->description = __('The text to use for the \'Previous\' page link used in the thumbnail paging.', 'wp-portfolio'); 
	$form->addFormElement($formElem);
	
	$formElem = new FormElement("setting_template_paging_next", __("Text for 'Next' link", 'wp-portfolio'));				
	$formElem->value = htmlentities($settings['setting_template_paging_next']);
	$formElem->description = __('The text to use for the \'Next\' page link used in the thumbnail paging.', 'wp-portfolio'); 
	$form->addFormElement($formElem);
	
	
	$form->addBreak('settings_css', '<div class="settings-spacer">&nbsp;</div><h2>' . __('Portfolio Stylesheet (CSS) Settings', 'wp-portfolio') . '</h2>');
	
	// Enable/Disable CSS mode
	$formElem = new FormElement("setting_disable_plugin_css", __("Disable Plugin CSS", 'wp-portfolio'));
	$formElem->value = $settings['setting_disable_plugin_css'];
	$formElem->setTypeAsCheckbox(__("If ticked, don't use the WP Portfolio CSS below.", 'wp-portfolio'));
	$formElem->description = '&bull; '.__('Allows you to switch off the default CSS so that you can use CSS in your template CSS file.', 'wp-portfolio').'<br/>'.
							sprintf('&bull; '.__('<strong>Advanced Tip:</strong> Once you\'re happy with the styles, you should really move all the CSS below into your template %s. This is so that visitor browsers can cache the stylesheet and reduce loading times. Any CSS placed here will be injected into the template &lt;head&gt; tag, which is not the most efficient method of delivering CSS.', 'wp-portfolio'), '<code>style.css</code>');
	$form->addFormElement($formElem);
	
	
	$formElem = new FormElement("setting_template_css", __("Template CSS", 'wp-portfolio'));				
	$formElem->value = htmlentities($settings['setting_template_css']);
	$formElem->description = __('This is the CSS code used to style the portfolio.', 'wp-portfolio');
	$formElem->setTypeAsTextArea(10, 70); 
	$form->addFormElement($formElem);	

	$formElem = new FormElement("setting_template_css_paging", __("Paging CSS", 'wp-portfolio'));				
	$formElem->value = htmlentities($settings['setting_template_css_paging']);
	$formElem->description = __('This is the CSS code used to style the paging area if you are showing your portfolio on several pages.', 'wp-portfolio');
	$formElem->setTypeAsTextArea(6, 70); 
	$form->addFormElement($formElem);	
	
	$formElem = new FormElement("setting_template_css_widget", __("Widget CSS", 'wp-portfolio'));
	$formElem->value = htmlentities($settings['setting_template_css_widget']);
	$formElem->description = __('This is the CSS code used to style the websites in the widget area.', 'wp-portfolio');
	$formElem->setTypeAsTextArea(6, 70); 
	$form->addFormElement($formElem);
	
	
	echo $form->toString();
	
	?>	

</div>
<?php 
}


/**
 * Show the page for refreshing thumbnails.
 */
function WPPortfolio_pages_showRefreshThumbnails()
{
	$page = new PageBuilder(true);
	$page->showPageHeader('WP Portfolio - ' . __('Refresh Thumbnails'),'75%');

	
	$updateType = false;
	if (isset($_POST['update'])) {
		$updateType = $_POST['update'];
	}
	
	
	switch ($updateType)
	{
		case 'clear_thumb_cache':
				$actualThumbPath = WPPortfolio_getThumbPathActualDir();
		
				// Delete all contents of directory but not the root
				WPPortfolio_unlinkRecursive($actualThumbPath, false);
						
				WPPortfolio_showMessage(__('Thumbnail cache has now been emptied.', 'wp-portfolio'));
			break;
			
		case 'refresh_all_thumbnails':
				WPPortfolio_thumbnails_refreshAll(0, true, true);
				echo '<p>&nbsp;</p>';
			break;
			
		case 'schedule_refresh_thumbnails':
				WPPortfolio_showMessage(__('Refresh schedule updated.', 'wp-portfolio'));
				
				// Set the selected time frequency in the database.
				$timeFreq = WPPortfolio_getArrayValue($_POST, 'schedule_count');
				update_option(WPP_STW_REFRESH_TIME, $timeFreq);
				
				// Update WP Cron - remove any existing hook, and then re-add.
				wp_clear_scheduled_hook('wpportfolio_schedule_refresh_thumbnails');
				if ($timeFreq == 'never')
				{ 
					WPPortfolio_showMessage(__('The automatic refresh of thumbnails has been disabled.', 'wp-portfolio'));
				}
				else 
				{
					// Trigger a daily update.
					if (!wp_next_scheduled('wpportfolio_schedule_refresh_thumbnails')) {
						wp_schedule_event(time(), 'daily', 'wpportfolio_schedule_refresh_thumbnails');
					}
				}

			break;
	}	
	
	?>	
	<h2><?php _e("Request a Thumbnail Recapture from STW", "wp-portfolio"); ?></h2>
		<p><?php echo __('For all of your <b>website thumbnails generated by STW</b>, this button will ask STW to <b>update the thumbnail of the webpage</b>. STW will attempt to refresh their thumbnails as quickly as possible, but this does not happen instantly.', 'wp-portfolio'); ?></p>
		<p><?php echo __('You may find that the thumbnails are <b>re-cached on your website before they\'ve been regenerated</b> by STW. Therefore you can just click on the <b>\'Clear Thumbnail Cache\'</b> button below to trigger the plugin to fetch the latest thumbnail versions from STW.', 'wp-portfolio'); ?></p>
	<?php
	$form = new FormBuilder('refresh_all_thumbnails');
	$form->setSubmitLabel(__('Refresh All Website Thumbnails', 'wp-portfolio'));	
	echo $form->toString();
		

	$nextScheduled = wp_next_scheduled('wpportfolio_schedule_refresh_thumbnails');
	if ($nextScheduled > 0) {
		$timeToNextCheck = human_time_diff(time(), wp_next_scheduled('wpportfolio_schedule_refresh_thumbnails')); 
	}
	?>	
	<hr/>
	<h2><?php _e("Request Thumbnail Recaptures from STW Automatically", "wp-portfolio"); ?></h2>
		<p><?php 
			_e('Use this option to automatically schedule updates to happen automatically. Checks are made every day for thumbnails <b>older than the setting below</b>. So if you select <b>weekly</b> as how often thumbnails will be checked, then when the checker executes, <b>any thumbnail older than 1 week</b> will be refreshed. Any thumbnails that were refreshed less than a week ago will be ignored until they are a week old.', 'wp-portfolio');?> </p> 
		<?php 
		
		echo '<p>';
		if ($nextScheduled > 0) {
			echo sprintf(__('The next check for thumbnails needing an update is in about <b>%s </b>.', 'wp-portfolio'), $timeToNextCheck); 
		} else {
			echo ' '; 
			_e('Automated checks are currently <b>disabled</b>.', 'wp-portfolio');
		}
		echo '</p>';
	
	
	$form = new FormBuilder('schedule_refresh_thumbnails');
	$form->setSubmitLabel(__('Set Refresh Schedule', 'wp-portfolio'));	 
	
	$formElement = new FormElement('schedule_count', __('How often should thumbnails be refreshed?', 'wp-portfolio'));
	$formElement->setTypeAsComboBox(array(
		'never' 		=> __('Never'),
		'daily' 		=> __('Daily'),
		'weekly' 		=> __('Weekly'),
		'monthly' 		=> __('Monthly'),
		'quarterly' 	=> __('Quarterly'),
	));
	$form->addFormElement($formElement);
	
	// Show which option is currently selected.
	$form->setDefaultValues(array(
		'schedule_count' => get_option(WPP_STW_REFRESH_TIME, 'never')
	));
	
	echo $form->toString();
	
	
	?>	
	<hr/>
	<h2><?php _e("Clear Thumbnail Cache", "wp-portfolio"); ?></h2>
		<p><?php echo __('Clearing the thumbnail cache will <b>remove all thumbnails</b> that have been fetched from STW or that have been created from your custom thumbnails.', 'wp-portfolio'); ?></p>
		<p><?php echo __('The thumbnails will be <b>recreated automatically</b> as they are displayed on your website.', 'wp-portfolio'); ?></p>
	<?php
	$form = new FormBuilder('clear_thumb_cache');
	$form->setSubmitLabel(__('Clear Thumbnail Cache', 'wp-portfolio'));	
	echo $form->toString();
	
	$page->showPageFooter();
}



/**
 * Simple function for reporting the status of the updates.
 */
function WPPortfolio_thumbnails_status($msg, $inner = false, $bottom = 0.25)
{
	printf('<div class="wpp_refresh_status_item" style="margin-left: %dpx; margin-bottom: %dpx">%s</div>', 	
		$inner*20, 	// Margin in px
		$bottom*20,	// Margin in px
		$msg
	);
	flush();
}

?>