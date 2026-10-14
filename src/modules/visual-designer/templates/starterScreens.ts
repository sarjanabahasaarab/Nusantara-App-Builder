/**
 * Nusantara App Builder - Starter Visual Design Templates
 * Creates realistic, fully functioning default visual designs for Android projects
 */

import { ProjectMetadata } from '../../../types/project';
import { VisualProjectDesign, VisualScreen, VisualComponent } from '../../../types/visualDesigner';

/**
 * Creates an empty root LinearLayout
 */
export function createEmptyRootComponent(): VisualComponent {
  return {
    id: 'root_layout',
    type: 'verticalLayout',
    name: 'Root Layout',
    properties: {
      id: 'root_layout',
      name: 'Root Layout',
      width: 'match_parent',
      height: 'match_parent',
      orientation: 'vertical',
      paddingTop: 16,
      paddingBottom: 16,
      paddingStart: 16,
      paddingEnd: 16,
      backgroundColor: '#0F172A',
    },
    children: [],
  };
}

/**
 * Creates starter visual design tailored to project template and metadata
 */
export function createDefaultProjectDesign(project: ProjectMetadata): VisualProjectDesign {
  const now = new Date().toISOString();
  let defaultScreen: VisualScreen;

  if (project.template === 'basic-activity') {
    defaultScreen = {
      id: 'screen_main',
      name: 'Home Screen',
      layoutFileName: 'activity_main.xml',
      orientation: 'portrait',
      devicePreset: 'pixel_7',
      backgroundColor: '#0F172A',
      root: {
        id: 'root_layout',
        type: 'verticalLayout',
        name: 'Root Layout',
        properties: {
          id: 'root_layout',
          name: 'Root Layout',
          width: 'match_parent',
          height: 'match_parent',
          orientation: 'vertical',
          paddingTop: 24,
          paddingBottom: 24,
          paddingStart: 20,
          paddingEnd: 20,
          backgroundColor: '#0F172A',
        },
        children: [
          {
            id: 'tv_app_title',
            type: 'heading',
            name: 'App Title',
            properties: {
              id: 'tv_app_title',
              name: 'App Title',
              width: 'match_parent',
              height: 'wrap_content',
              text: project.displayName || project.name,
              textSize: 26,
              textColor: '#FFFFFF',
              textStyle: 'bold',
              marginBottom: 8,
            },
          },
          {
            id: 'tv_app_subtitle',
            type: 'text',
            name: 'App Subtitle',
            properties: {
              id: 'tv_app_subtitle',
              name: 'App Subtitle',
              width: 'match_parent',
              height: 'wrap_content',
              text: 'Dibuat dengan Nusantara App Builder. Antarmuka ini dapat dikustomisasi secara visual maupun melalui kode Kotlin.',
              textSize: 14,
              textColor: '#94A3B8',
              marginBottom: 20,
            },
          },
          {
            id: 'card_info',
            type: 'card',
            name: 'Information Card',
            properties: {
              id: 'card_info',
              name: 'Information Card',
              width: 'match_parent',
              height: 'wrap_content',
              elevation: 4,
              cardCornerRadius: 14,
              backgroundColor: '#1E293B',
              paddingTop: 16,
              paddingBottom: 16,
              paddingStart: 16,
              paddingEnd: 16,
              marginBottom: 20,
            },
            children: [
              {
                id: 'tv_card_header',
                type: 'label',
                name: 'Card Status Label',
                properties: {
                  id: 'tv_card_header',
                  name: 'Card Status Label',
                  width: 'wrap_content',
                  height: 'wrap_content',
                  text: 'ANDROID NATIVE READY',
                  textSize: 11,
                  textColor: '#38BDF8',
                  textStyle: 'bold',
                  marginBottom: 6,
                },
              },
              {
                id: 'tv_card_body',
                type: 'text',
                name: 'Card Description',
                properties: {
                  id: 'tv_card_body',
                  name: 'Card Description',
                  width: 'match_parent',
                  height: 'wrap_content',
                  text: `ID Paket: ${project.packageId}\nTarget SDK: API ${project.targetSdk} (Android 14)`,
                  textSize: 13,
                  textColor: '#E2E8F0',
                },
              },
            ],
          },
          {
            id: 'btn_click_action',
            type: 'button',
            name: 'Primary Button',
            properties: {
              id: 'btn_click_action',
              name: 'Primary Button',
              width: 'match_parent',
              height: 'wrap_content',
              buttonLabel: 'Klik untuk Respons',
              buttonBackgroundColor: '#2563EB',
              buttonTextColor: '#FFFFFF',
              cornerRadius: 10,
              textSize: 15,
              actionType: 'toast',
              actionPayload: 'Tombol berhasil ditekan!',
              marginBottom: 12,
            },
          },
          {
            id: 'sw_notifications',
            type: 'switch',
            name: 'Notification Toggle',
            properties: {
              id: 'sw_notifications',
              name: 'Notification Toggle',
              width: 'match_parent',
              height: 'wrap_content',
              label: 'Aktifkan Notifikasi Aplikasi',
              isChecked: true,
              tintColor: '#2563EB',
            },
          },
        ],
      },
    };
  } else if (project.template === 'webview-starter') {
    defaultScreen = {
      id: 'screen_webview',
      name: 'WebView Screen',
      layoutFileName: 'activity_main.xml',
      orientation: 'portrait',
      devicePreset: 'pixel_7',
      backgroundColor: '#0F172A',
      root: {
        id: 'root_layout',
        type: 'verticalLayout',
        name: 'Root Layout',
        properties: {
          id: 'root_layout',
          name: 'Root Layout',
          width: 'match_parent',
          height: 'match_parent',
          orientation: 'vertical',
          paddingTop: 16,
          paddingBottom: 16,
          paddingStart: 16,
          paddingEnd: 16,
          backgroundColor: '#0F172A',
        },
        children: [
          {
            id: 'tv_webview_header',
            type: 'heading',
            name: 'Header Title',
            properties: {
              id: 'tv_webview_header',
              name: 'Header Title',
              width: 'match_parent',
              height: 'wrap_content',
              text: project.displayName || 'Website Launcher',
              textSize: 22,
              textColor: '#FFFFFF',
              textStyle: 'bold',
              marginBottom: 4,
            },
          },
          {
            id: 'tv_webview_url',
            type: 'text',
            name: 'URL Target',
            properties: {
              id: 'tv_webview_url',
              name: 'URL Target',
              width: 'match_parent',
              height: 'wrap_content',
              text: project.targetUrl || 'https://google.com',
              textSize: 13,
              textColor: '#38BDF8',
              marginBottom: 16,
            },
          },
          {
            id: 'pb_loading',
            type: 'progressBar',
            name: 'Progress Bar',
            properties: {
              id: 'pb_loading',
              name: 'Progress Bar',
              width: 'match_parent',
              height: 'wrap_content',
              progress: 85,
              maxProgress: 100,
              progressStyle: 'horizontal',
              tintColor: '#2563EB',
              marginBottom: 16,
            },
          },
          {
            id: 'card_webview_container',
            type: 'card',
            name: 'WebView Display Frame',
            properties: {
              id: 'card_webview_container',
              name: 'WebView Display Frame',
              width: 'match_parent',
              height: 380,
              elevation: 2,
              cardCornerRadius: 10,
              backgroundColor: '#1E293B',
              paddingTop: 16,
              paddingBottom: 16,
              paddingStart: 16,
              paddingEnd: 16,
            },
            children: [
              {
                id: 'tv_preview_note',
                type: 'text',
                name: 'Preview Note',
                properties: {
                  id: 'tv_preview_note',
                  name: 'Preview Note',
                  width: 'match_parent',
                  height: 'wrap_content',
                  text: `Area WebView Native Android\nURL Target: ${project.targetUrl || 'https://google.com'}\n\nFitur bawaan:\n• Hardware Acceleration\n• SSL & Network Fallback Error Screen\n• Back Button Navigation Handler\n• Secure Local Storage Isolation`,
                  textSize: 13,
                  textColor: '#CBD5E1',
                },
              },
            ],
          },
        ],
      },
    };
  } else {
    // Empty Android Project default
    defaultScreen = {
      id: 'screen_main',
      name: 'Main Screen',
      layoutFileName: 'activity_main.xml',
      orientation: 'portrait',
      devicePreset: 'pixel_7',
      backgroundColor: '#0F172A',
      root: {
        id: 'root_layout',
        type: 'verticalLayout',
        name: 'Root Layout',
        properties: {
          id: 'root_layout',
          name: 'Root Layout',
          width: 'match_parent',
          height: 'match_parent',
          orientation: 'vertical',
          paddingTop: 24,
          paddingBottom: 24,
          paddingStart: 20,
          paddingEnd: 20,
          backgroundColor: '#0F172A',
        },
        children: [
          {
            id: 'tv_hello_world',
            type: 'heading',
            name: 'Hello World Title',
            properties: {
              id: 'tv_hello_world',
              name: 'Hello World Title',
              width: 'match_parent',
              height: 'wrap_content',
              text: `Selamat Datang di ${project.displayName || project.name}`,
              textSize: 24,
              textColor: '#FFFFFF',
              textStyle: 'bold',
              marginBottom: 8,
            },
          },
          {
            id: 'tv_description',
            type: 'text',
            name: 'Description Text',
            properties: {
              id: 'tv_description',
              name: 'Description Text',
              width: 'match_parent',
              height: 'wrap_content',
              text: 'Mulai mendesain dengan menyeret komponen dari panel kiri ke kanvas ponsel ini.',
              textSize: 14,
              textColor: '#94A3B8',
              marginBottom: 20,
            },
          },
        ],
      },
    };
  }

  return {
    schemaVersion: 1,
    projectId: project.id,
    projectName: project.name,
    packageId: project.packageId,
    screens: [defaultScreen],
    activeScreenId: defaultScreen.id,
    startScreenId: defaultScreen.id,
    createdAt: now,
    updatedAt: now,
    formatVersion: '3.0',
  };
}

/**
 * Creates a new blank screen
 */
export function createNewBlankScreen(
  screenId: string,
  name: string,
  layoutFileName: string
): VisualScreen {
  return {
    id: screenId,
    name,
    layoutFileName,
    orientation: 'portrait',
    devicePreset: 'pixel_7',
    backgroundColor: '#0F172A',
    root: {
      id: 'root_layout',
      type: 'verticalLayout',
      name: 'Root Layout',
      properties: {
        id: 'root_layout',
        name: 'Root Layout',
        width: 'match_parent',
        height: 'match_parent',
        orientation: 'vertical',
        paddingTop: 24,
        paddingBottom: 24,
        paddingStart: 20,
        paddingEnd: 20,
        backgroundColor: '#0F172A',
      },
      children: [
        {
          id: `tv_title_${Date.now().toString(36).substring(2, 6)}`,
          type: 'heading',
          name: 'Page Title',
          properties: {
            id: `tv_title_${Date.now().toString(36).substring(2, 6)}`,
            name: 'Page Title',
            width: 'match_parent',
            height: 'wrap_content',
            text: name,
            textSize: 24,
            textColor: '#FFFFFF',
            textStyle: 'bold',
            marginBottom: 8,
          },
        },
      ],
    },
  };
}
